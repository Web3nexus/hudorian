<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookCollection;
use App\Services\Library\BookCheckoutService;
use App\Services\Library\LibrarySettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookController extends Controller
{
    public function __construct(
        protected LibrarySettingsService $settingsService,
        protected BookCheckoutService $checkoutService
    ) {}

    /**
     * Public library policy (purchase/rental toggles, default term, terms text).
     */
    public function config(): JsonResponse
    {
        return response()->json([
            'data' => $this->settingsService->getPublicConfig(),
        ]);
    }

    /**
     * Public catalogue of published titles.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => 'nullable|string|max:120',
            'collection' => 'nullable|string|max:120',
            'format' => 'nullable|string|in:'.implode(',', Book::FORMATS),
            'availability' => 'nullable|string|in:purchase,rental,both',
            'featured' => 'nullable|boolean',
            'sort' => 'nullable|string|in:newest,oldest,price_asc,price_desc,title',
            'per_page' => 'nullable|integer|min:1|max:60',
        ]);

        $query = Book::published()
            ->with('collection')
            ->search($validated['search'] ?? null);

        if (! empty($validated['collection'])) {
            $query->whereHas('collection', fn ($q) => $q->where('slug', $validated['collection']));
        }

        if (! empty($validated['format'])) {
            $query->where('format', $validated['format']);
        }

        if (! empty($validated['featured'])) {
            $query->where('is_featured', true);
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
            'price_asc' => $query->orderByRaw('purchase_price ASC'),
            'price_desc' => $query->orderByRaw('purchase_price DESC'),
            'title' => $query->orderBy('title'),
            default => $query->latest(),
        };

        $perPage = (int) ($validated['per_page'] ?? 12);
        $paginator = $query->paginate($perPage)->withQueryString();

        return response()->json([
            'data' => collect($paginator->items())->map(fn (Book $book) => $book->toPublicArray()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
            'collections' => $this->collectionOptions(),
        ]);
    }

    /**
     * A single title, with the requesting user's access state resolved.
     */
    public function show(Request $request, string $slug): JsonResponse
    {
        $book = Book::published()
            ->with('collection')
            ->where('slug', $slug)
            ->firstOrFail();

        $loan = null;
        // This is a public route, so the default guard is empty even when a
        // bearer token is present; the token guard has to be asked directly or
        // a reader would never see their own access on the title page.
        $user = $request->user() ?? $request->user('sanctum');

        if ($user) {
            $loan = $this->checkoutService->activeLoan($user, $book);
        }

        return response()->json([
            'data' => array_merge($book->toPublicArray(), [
                'access' => $loan ? $this->accessPayload($loan) : null,
            ]),
            'config' => $this->settingsService->getPublicConfig(),
        ]);
    }

    protected function accessPayload($loan): array
    {
        return [
            'loan_id' => $loan->id,
            'loan_type' => $loan->loan_type,
            'status' => $loan->status,
            'granted_at' => $loan->granted_at?->toIso8601String(),
            'expires_at' => $loan->expires_at?->toIso8601String(),
            'days_remaining' => $loan->daysRemaining(),
            'download_count' => $loan->download_count,
        ];
    }

    protected function collectionOptions(): array
    {
        return BookCollection::where('is_active', true)
            ->withCount(['books' => fn ($q) => $q->published()])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (BookCollection $c) => [
                'slug' => $c->slug,
                'name' => $c->name,
                'books_count' => $c->books_count,
            ])
            ->all();
    }
}
