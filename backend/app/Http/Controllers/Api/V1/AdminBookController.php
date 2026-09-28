<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookCollection;
use App\Models\BookLoan;
use App\Models\User;
use App\Services\Audit\AuditLogger;
use App\Services\Library\BookCheckoutService;
use App\Services\Library\LibrarySettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminBookController extends Controller
{
    public function __construct(
        protected AuditLogger $auditLogger,
        protected BookCheckoutService $checkoutService,
        protected LibrarySettingsService $settingsService
    ) {}

    /**
     * Enumerations, options and the rental policy for the admin form.
     */
    public function reference(): JsonResponse
    {
        return response()->json([
            'data' => [
                'formats' => Book::FORMATS,
                'statuses' => Book::STATUSES,
                'loan_types' => BookLoan::TYPES,
                'loan_statuses' => BookLoan::STATUSES,
                'settings' => $this->settingsService->getSettings(),
                'collections' => BookCollection::orderBy('sort_order')->orderBy('name')
                    ->get(['id', 'name', 'slug', 'is_active'])
                    ->all(),
                'members' => User::orderBy('name')
                    ->whereIn('role', ['member', 'admin'])
                    ->limit(200)
                    ->get(['id', 'name', 'email'])
                    ->all(),
            ],
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => 'nullable|string|max:120',
            'status' => 'nullable|string|in:'.implode(',', Book::STATUSES),
            'collection' => 'nullable|integer',
            'availability' => 'nullable|string|in:purchase,rental,both',
            'sort' => 'nullable|string|in:newest,oldest,title,price_asc,price_desc',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $query = Book::with('collection')
            ->withCount('loans')
            ->search($validated['search'] ?? null);

        if (! empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        if (! empty($validated['collection'])) {
            $query->where('collection_id', $validated['collection']);
        }

        $availability = $validated['availability'] ?? null;
        if ($availability === 'purchase') {
            $query->where('allow_purchase', true);
        } elseif ($availability === 'rental') {
            $query->where('allow_rental', true);
        } elseif ($availability === 'both') {
            $query->where('allow_purchase', true)->where('allow_rental', true);
        }

        match ($validated['sort'] ?? 'newest') {
            'oldest' => $query->oldest(),
            'title' => $query->orderBy('title'),
            'price_asc' => $query->orderByRaw('purchase_price ASC'),
            'price_desc' => $query->orderByRaw('purchase_price DESC'),
            default => $query->latest(),
        };

        $paginator = $query->paginate((int) ($validated['per_page'] ?? 20))->withQueryString();

        return response()->json([
            'data' => collect($paginator->items())->map(fn (Book $b) => $this->adminPayload($b)),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * A single title for the editor, including the protected source URL.
     */
    public function show(int $id): JsonResponse
    {
        $book = Book::with('collection')->withCount('loans')->findOrFail($id);

        return response()->json(['data' => $this->adminPayload($book)]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['title']);

        $book = DB::transaction(function () use ($data) {
            return Book::create($data);
        });

        $this->auditLogger->log($request->user(), 'book.created', 'Book', $book->id, [
            'title' => $book->title,
            'author' => $book->author,
        ]);

        return response()->json([
            'message' => 'Title added to the Royal Archive.',
            'data' => $this->adminPayload($book),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $book = Book::findOrFail($id);
        $data = $this->validated($request, $book);

        if (! empty($data['slug']) && $data['slug'] !== $book->slug) {
            $data['slug'] = $this->uniqueSlug($data['slug'], $book->id);
        }

        $book->update($data);

        $this->auditLogger->log($request->user(), 'book.updated', 'Book', $book->id, [
            'title' => $book->title,
            'changes' => array_keys($data),
        ]);

        return response()->json([
            'message' => 'Title updated.',
            'data' => $this->adminPayload($book->fresh()),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $book = Book::withCount('loans')->findOrFail($id);

        if ($book->loans_count > 0) {
            return response()->json([
                'message' => 'This title has active reader loans. Archive it instead of deleting so existing access is preserved.',
            ], 409);
        }

        $title = $book->title;
        $book->delete();

        $this->auditLogger->log($request->user(), 'book.deleted', 'Book', $id, [
            'title' => $title,
        ]);

        return response()->json(['message' => 'Title removed from the Royal Archive.']);
    }

    /**
     * The full loan ledger, filterable by loan state.
     */
    public function loans(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'nullable|string|in:'.implode(',', BookLoan::STATUSES),
            'book_id' => 'nullable|integer',
            'loan_type' => 'nullable|string|in:'.implode(',', BookLoan::TYPES),
            'search' => 'nullable|string|max:120',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $query = BookLoan::with(['book', 'user'])
            ->when($validated['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->when($validated['book_id'] ?? null, fn ($q, $v) => $q->where('book_id', $v))
            ->when($validated['loan_type'] ?? null, fn ($q, $v) => $q->where('loan_type', $v));

        if (! empty($validated['search'])) {
            $like = '%'.trim($validated['search']).'%';
            $query->where(function ($q) use ($like) {
                $q->whereHas('user', fn ($uq) => $uq->where('name', 'like', $like)->orWhere('email', 'like', $like))
                    ->orWhereHas('book', fn ($bq) => $bq->where('title', 'like', $like));
            });
        }

        $paginator = $query->orderByDesc('granted_at')
            ->paginate((int) ($validated['per_page'] ?? 20))
            ->withQueryString();

        return response()->json([
            'data' => collect($paginator->items())->map(fn (BookLoan $l) => [
                'id' => $l->id,
                'loan_type' => $l->loan_type,
                'status' => $l->status,
                'grants_access' => $l->grantsAccess(),
                'granted_at' => $l->granted_at?->toIso8601String(),
                'expires_at' => $l->expires_at?->toIso8601String(),
                'days_remaining' => $l->daysRemaining(),
                'download_count' => $l->download_count,
                'book' => $l->book?->only(['id', 'title', 'slug']),
                'reader' => $l->user?->only(['id', 'name', 'email']),
            ]),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * Grant a title by hand — a complimentary copy or a rental extension.
     */
    public function grant(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'book_id' => 'required|integer|exists:books,id',
            'user_id' => 'required|integer|exists:users,id',
            'loan_type' => 'required|in:'.implode(',', BookLoan::TYPES),
            'rental_days' => 'nullable|integer|min:1|max:365',
            'note' => 'nullable|string|max:500',
        ]);

        $book = Book::findOrFail($validated['book_id']);
        $user = User::findOrFail($validated['user_id']);

        // A hand-granted term is still bounded by the archive's own ceiling.
        $rentalDays = $validated['loan_type'] === BookCheckoutService::MODE_RENTAL
            ? min(
                (int) ($validated['rental_days'] ?? $book->effective_rental_days),
                (int) $this->settingsService->getSettings()['max_rental_days']
            )
            : null;

        $loan = $this->checkoutService->grantAccess(
            $book,
            $user,
            $validated['loan_type'],
            $rentalDays
        );

        $this->auditLogger->log($request->user(), 'book.access_granted', 'Book', $book->id, [
            'reader' => $user->email,
            'loan_type' => $loan->loan_type,
            'loan_id' => $loan->id,
            'expires_at' => $loan->expires_at?->toIso8601String(),
            'note' => $validated['note'] ?? null,
        ]);

        return response()->json([
            'message' => 'Access granted to '.$user->name.'.',
            'data' => [
                'id' => $loan->id,
                'loan_type' => $loan->loan_type,
                'status' => $loan->status,
                'expires_at' => $loan->expires_at?->toIso8601String(),
            ],
        ], 201);
    }

    /**
     * Revoke a reader's access to a title.
     */
    public function revoke(Request $request, int $loanId): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $loan = BookLoan::with(['book', 'user'])->findOrFail($loanId);

        $loan->update(['status' => 'revoked']);

        $this->auditLogger->log($request->user(), 'book.access_revoked', 'Book', $loan->book_id, [
            'reader' => $loan->user?->email,
            'loan_id' => $loan->id,
            'reason' => $validated['reason'] ?? null,
        ]);

        return response()->json(['message' => 'Access revoked.']);
    }

    public function getSettings(): JsonResponse
    {
        return response()->json(['data' => $this->settingsService->getSettings()]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'purchase_enabled' => 'required|boolean',
            'rental_enabled' => 'required|boolean',
            'default_rental_days' => 'required|integer|min:1|max:365',
            'max_rental_days' => 'required|integer|min:1|max:365',
            'rental_terms' => 'required|string|max:2000',
            'purchase_terms' => 'required|string|max:2000',
        ]);

        $settings = $this->settingsService->updateSettings($validated);

        $this->auditLogger->log($request->user(), 'book.settings_updated', 'CmsBlock', null, [
            'default_rental_days' => $settings['default_rental_days'],
            'rental_enabled' => $settings['rental_enabled'],
        ]);

        return response()->json([
            'message' => 'Royal Archive policy updated.',
            'data' => $settings,
        ]);
    }

    /**
     * Explicitly reveal the protected source URL for steward inspection.
     */
    protected function adminPayload(Book $book): array
    {
        return array_merge($book->toPublicArray(), [
            'file_url' => $book->file_url,
            'loans_count' => $book->loans_count ?? $book->loans()->count(),
        ]);
    }

    protected function validated(Request $request, ?Book $book = null): array
    {
        $isUpdate = (bool) $book;

        $rules = [
            'title' => ($isUpdate ? 'sometimes' : 'required').'|string|max:255',
            'slug' => 'nullable|string|max:255',
            'author' => ($isUpdate ? 'sometimes' : 'required').'|string|max:255',
            'isbn' => 'nullable|string|max:20',
            'format' => ($isUpdate ? 'sometimes' : 'required').'|string|in:'.implode(',', Book::FORMATS),
            'language' => 'nullable|string|max:8',
            'published_year' => 'nullable|string|max:4',
            'page_count' => 'nullable|integer|min:1|max:20000',
            'short_description' => 'nullable|string|max:500',
            'description' => ($isUpdate ? 'sometimes' : 'required').'|string|max:20000',
            'cover_image' => 'nullable|url|max:2048',
            'file_url' => 'nullable|url|max:2048',
            // Either price may be omitted; a mode with no price is simply not
            // offered (see the normalisation below).
            'purchase_price' => ($isUpdate ? 'sometimes' : 'nullable').'|numeric|min:0|max:9999999',
            'rental_price' => ($isUpdate ? 'sometimes' : 'nullable').'|numeric|min:0|max:9999999',
            'currency' => 'nullable|string|size:3',
            'rental_days' => 'nullable|integer|min:1|max:365',
            'collection_id' => 'nullable|integer|exists:book_collections,id',
            'allow_purchase' => 'nullable|boolean',
            'allow_rental' => 'nullable|boolean',
            'status' => ($isUpdate ? 'sometimes' : 'required').'|string|in:'.implode(',', Book::STATUSES),
            'is_featured' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0|max:9999',
        ];

        $data = $request->validate($rules);

        // On create the archive's base currency is the default. On a partial
        // update an absent key must be left alone, or a partial save would
        // silently reprice the title back to EUR.
        if (! $isUpdate || array_key_exists('currency', $data)) {
            $data['currency'] = strtoupper($data['currency'] ?? null ?: 'EUR');
        }

        // Resolve the effective price per mode, falling back to the stored
        // value on a partial update so a mode is never silently zeroed.
        $effectivePurchase = (float) ($data['purchase_price'] ?? $book?->purchase_price ?? 0);
        $effectiveRental = (float) ($data['rental_price'] ?? $book?->rental_price ?? 0);

        // A title cannot be offered in a mode it has no price for.
        if ($effectivePurchase <= 0) {
            $data['allow_purchase'] = false;
        }

        if ($effectiveRental <= 0) {
            $data['allow_rental'] = false;
        }

        return $data;
    }

    protected function uniqueSlug(string $value, ?int $ignoreId = null): string
    {
        $base = Str::slug($value) ?: 'title';
        $slug = $base;
        $i = 2;

        while (
            Book::where('slug', $slug)
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $base.'-'.$i;
            $i++;
        }

        return $slug;
    }
}
