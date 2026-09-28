<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Amenity;
use App\Models\Estate;
use App\Models\House;
use App\Models\Location;
use App\Services\Audit\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminHouseController extends Controller
{
    /**
     * Selectable options + allowed enums used to drive the SecureGate house editor.
     */
    public const HOUSE_TYPES = [
        'house',
        'estate',
        'club',
        'retreat',
        'villa',
        'city_house',
    ];

    public const STATUSES = [
        'active',
        'coming_soon',
        'members_only',
        'archived',
    ];

    /**
     * Maximum length of the `houses.slug` column.
     */
    protected const SLUG_MAX_LENGTH = 255;

    protected AuditLogger $auditLogger;

    public function __construct(AuditLogger $auditLogger)
    {
        $this->auditLogger = $auditLogger;
    }

    public function index(): JsonResponse
    {
        $houses = House::with(['location', 'estate', 'amenities', 'rooms', 'events'])
            ->withCount('rooms')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return response()->json([
            'data' => $houses,
        ]);
    }

    public function reference(): JsonResponse
    {
        return response()->json([
            'data' => [
                'locations' => Location::orderBy('name')->get(['id', 'name', 'slug', 'country', 'region']),
                'estates' => Estate::orderBy('name')->get(['id', 'name', 'slug', 'location_id']),
                'amenities' => Amenity::orderBy('category')->orderBy('name')->get(['id', 'name', 'slug', 'icon', 'category']),
                'house_types' => self::HOUSE_TYPES,
                'statuses' => self::STATUSES,
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'location_id' => 'required|exists:locations,id',
            'estate_id' => 'nullable|exists:estates,id',
            'tagline' => 'nullable|string|max:255',
            'house_type' => 'required|string|in:'.implode(',', self::HOUSE_TYPES),
            'short_description' => 'nullable|string|max:500',
            'description' => 'required|string',
            'address' => 'required|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'hero_image' => 'nullable|string',
            'hero_video' => 'nullable|string',
            'status' => 'required|in:'.implode(',', self::STATUSES),
            'is_featured' => 'boolean',
            'sort_order' => 'nullable|integer',
            'amenities' => 'nullable|array',
            'amenities.*' => 'exists:amenities,id',
        ]);

        $validated['slug'] = $this->resolveSlug($validated['slug'] ?? null, $validated['name']);

        $amenityIds = $validated['amenities'] ?? [];
        unset($validated['amenities']);

        $house = House::create($validated);
        if (! empty($amenityIds)) {
            $house->amenities()->sync($amenityIds);
        }

        $this->auditLogger->log($request->user(), 'house.created', 'House', $house->id, ['name' => $house->name]);

        return response()->json([
            'message' => 'House created successfully.',
            'data' => $house->load(['location', 'estate', 'amenities']),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $house = House::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'nullable|string|max:255',
            'location_id' => 'sometimes|exists:locations,id',
            'estate_id' => 'nullable|exists:estates,id',
            'tagline' => 'nullable|string|max:255',
            'house_type' => 'sometimes|string|in:'.implode(',', self::HOUSE_TYPES),
            'short_description' => 'nullable|string|max:500',
            'description' => 'sometimes|string',
            'address' => 'sometimes|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'hero_image' => 'nullable|string',
            'hero_video' => 'nullable|string',
            'status' => 'sometimes|in:'.implode(',', self::STATUSES),
            'is_featured' => 'boolean',
            'sort_order' => 'nullable|integer',
            'amenities' => 'nullable|array',
            'amenities.*' => 'exists:amenities,id',
        ]);

        if (array_key_exists('slug', $validated)) {
            $validated['slug'] = $this->resolveSlug($validated['slug'] ?: null, $validated['name'] ?? $house->name, $house->id);
        }

        if (isset($validated['amenities'])) {
            $house->amenities()->sync($validated['amenities']);
            unset($validated['amenities']);
        }

        $house->update($validated);

        $this->auditLogger->log($request->user(), 'house.updated', 'House', $house->id, ['name' => $house->name]);

        return response()->json([
            'message' => 'House updated successfully.',
            'data' => $house->load(['location', 'estate', 'amenities'])->loadCount('rooms'),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $house = House::findOrFail($id);
        $houseName = $house->name;
        $house->delete();

        $this->auditLogger->log($request->user(), 'house.deleted', 'House', $id, ['name' => $houseName]);

        return response()->json([
            'message' => 'House deleted successfully.',
        ]);
    }

    /**
     * Normalise a requested slug, falling back to the house name and
     * de-duplicating against records other than $ignoreId.
     *
     * Uniqueness is resolved here rather than by a `unique` validation rule so
     * that an explicit slug collision is de-duplicated exactly like an
     * auto-generated one, and the base is truncated so any appended suffix
     * still fits within the column limit.
     */
    protected function resolveSlug(?string $requested, string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($requested ?: $name);
        if ($base === '') {
            $base = 'sanctuary';
        }

        $base = mb_substr($base, 0, self::SLUG_MAX_LENGTH);

        $slug = $base;
        $counter = 1;
        while (House::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            // Reserve room for the separator and the counter, which grows.
            $suffix = '-'.$counter++;
            $slug = mb_substr($base, 0, max(1, self::SLUG_MAX_LENGTH - strlen($suffix))).$suffix;
        }

        return $slug;
    }
}
