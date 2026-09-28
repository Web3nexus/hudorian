<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BookLoan;
use App\Services\Library\BookCheckoutService;
use App\Services\Library\LibrarySettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\ValidationException;

class MyArchiveController extends Controller
{
    public function __construct(
        protected BookCheckoutService $checkoutService,
        protected LibrarySettingsService $settingsService
    ) {}

    /**
     * The reader's own shelf: perpetual holdings and live rentals.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Settle any lapsed rentals on the way out so the shelf is honest.
        BookLoan::where('user_id', $user->id)
            ->where('status', 'active')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->update(['status' => 'expired']);

        $loans = BookLoan::with('book.collection')
            ->where('user_id', $user->id)
            ->whereIn('status', ['active', 'expired'])
            ->orderByDesc('granted_at')
            ->get();

        $payload = $loans->map(fn (BookLoan $loan) => [
            'id' => $loan->id,
            'loan_type' => $loan->loan_type,
            'status' => $loan->status,
            'grants_access' => $loan->grantsAccess(),
            'granted_at' => $loan->granted_at?->toIso8601String(),
            'expires_at' => $loan->expires_at?->toIso8601String(),
            'days_remaining' => $loan->daysRemaining(),
            'download_count' => $loan->download_count,
            'last_downloaded_at' => $loan->last_downloaded_at?->toIso8601String(),
            'book' => $loan->book ? array_merge($loan->book->toPublicArray(), [
                'collection_name' => $loan->book->collection?->name,
            ]) : null,
        ]);

        // grantsAccess() is a method rather than an attribute, so the live
        // rental count has to be resolved against the models themselves.
        $liveRentals = $loans->filter(
            fn (BookLoan $l) => $l->loan_type === BookCheckoutService::MODE_RENTAL && $l->grantsAccess()
        );

        return response()->json([
            'data' => [
                'shelf' => $payload,
                'summary' => [
                    'owned' => $loans->where('loan_type', BookCheckoutService::MODE_PURCHASE)->count(),
                    'active_rentals' => $liveRentals->count(),
                    'expired' => $loans->where('status', 'expired')->count(),
                ],
            ],
            'config' => $this->settingsService->getPublicConfig(),
        ]);
    }

    /**
     * Issue a short-lived signed download link for a loan.
     */
    public function download(Request $request, int $loanId): JsonResponse
    {
        $user = $request->user();

        $loan = BookLoan::with('book')
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->findOrFail($loanId);

        if (! $loan->grantsAccess()) {
            throw ValidationException::withMessages([
                'loan' => 'Your access to this title has lapsed. Renew the rental to resume reading.',
            ]);
        }

        $book = $loan->book;
        if (! $book || blank($book->file_url)) {
            return response()->json([
                'error' => 'File Unavailable',
                'message' => 'This edition has not yet been prepared for delivery.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'download_url' => URL::temporarySignedRoute(
                    'api.v1.library.download.serve',
                    now()->addMinutes(5),
                    ['loan' => $loan->id]
                ),
                'filename' => $this->filenameFor($book),
                'format' => $book->format,
                'expires_in_minutes' => 5,
            ],
        ]);
    }

    /**
     * Redeem a signed link and hand back the protected file.
     */
    public function serve(Request $request, int $loan)
    {
        $user = $request->user();

        $loan = BookLoan::with('book')
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->findOrFail($loan);

        if (! $loan->grantsAccess()) {
            return response()->json(['message' => 'Access has lapsed.'], 403);
        }

        $book = $loan->book;
        if (! $book || blank($book->file_url)) {
            return response()->json(['message' => 'File unavailable.'], 404);
        }

        $source = $this->validatedSourceUrl($book->file_url);
        if (! $source) {
            return response()->json(['message' => 'File unavailable.'], 404);
        }

        // Opened before the download is recorded: a source that cannot be reached
        // is a failed delivery, not something the reader took away.
        $handle = @fopen($source, 'rb');
        if (! $handle) {
            return response()->json([
                'message' => 'The protected file could not be reached. Please try again shortly.',
            ], 502);
        }

        // Counted on redemption rather than on link issuance, so a reader who
        // never follows the link is not recorded as having taken the volume.
        $this->checkoutService->recordDownload($loan);

        // Stored URLs are absolute (e.g. an S3 or CDN object). Proxying keeps
        // the origin location off the client and preserves the short-lived
        // signature semantics.
        return response()->stream(
            function () use ($handle) {
                while (! feof($handle)) {
                    echo fread($handle, 8192);
                    flush();
                }
                fclose($handle);
            },
            200,
            [
                'Content-Type' => $book->format === 'epub' ? 'application/epub+zip' : 'application/pdf',
                'Content-Disposition' => 'attachment; filename="'.$this->filenameFor($book).'"',
                'Cache-Control' => 'private, no-store',
            ]
        );
    }

    /**
     * Only absolute http(s) URLs from an external host may be proxied. Anything
     * else (file://, gopher://, an internal address) is rejected so a mistyped
     * or tampered file_url cannot be used to read local or private resources.
     */
    protected function validatedSourceUrl(?string $url): ?string
    {
        if (blank($url) || ! filter_var($url, FILTER_VALIDATE_URL)) {
            return null;
        }

        $parts = parse_url($url);
        if (! is_array($parts) || ! in_array(strtolower($parts['scheme'] ?? ''), ['http', 'https'], true)) {
            return null;
        }

        if (blank($parts['host'] ?? null)) {
            return null;
        }

        $host = strtolower($parts['host']);
        $blocked = ['localhost', '127.0.0.1', '0.0.0.0', '::1', 'metadata.google.internal'];
        if (in_array($host, $blocked, true) || str_ends_with($host, '.local') || str_ends_with($host, '.internal')) {
            return null;
        }

        return $url;
    }

    /**
     * A lapsed rental is renewed by taking a fresh rental payment, so a lapsed
     * loan is never revived for free. This endpoint only reports whether the
     * loan is eligible; the reader then settles through the normal checkout.
     */
    public function renew(Request $request, int $loanId): JsonResponse
    {
        $user = $request->user();

        $loan = BookLoan::with('book')
            ->where('user_id', $user->id)
            ->findOrFail($loanId);

        if ($loan->loan_type !== BookCheckoutService::MODE_RENTAL) {
            return response()->json([
                'error' => 'Not Renewable',
                'message' => 'A purchased title is perpetual and needs no renewal.',
            ], 422);
        }

        if ($loan->status === 'revoked') {
            return response()->json([
                'error' => 'Access Withdrawn',
                'message' => 'This loan was withdrawn by the archive. Please contact the concierge.',
            ], 403);
        }

        if ($loan->grantsAccess()) {
            return response()->json([
                'error' => 'Already Active',
                'message' => 'This rental is still running.',
            ], 422);
        }

        $book = $loan->book;

        if (! $book || ! $book->allow_rental || $book->rental_price <= 0) {
            return response()->json([
                'error' => 'Renewal Unavailable',
                'message' => 'This title is not currently available for rental.',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Complete the rental payment to resume reading this title.',
            'data' => [
                'book_id' => $book->id,
                'mode' => BookCheckoutService::MODE_RENTAL,
                'rental_days' => $book->effective_rental_days,
            ],
        ]);
    }

    protected function filenameFor($book): string
    {
        $base = preg_replace('/[^A-Za-z0-9]+/', '-', $book->title) ?? 'title';
        $base = trim($base, '-') ?: 'title';

        return strtolower($base).'.'.strtolower($book->format);
    }
}
