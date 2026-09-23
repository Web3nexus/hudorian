<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\House;
use App\Services\Audit\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminHouseController extends Controller
{
    protected AuditLogger $auditLogger;

    public function __construct(AuditLogger $auditLogger)
    {
        $this->auditLogger = $auditLogger;
    }

    public function index(): JsonResponse
    {
        $houses = House::with(['location', 'amenities', 'rooms', 'events'])
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'data' => $houses,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location_id' => 'required|exists:locations,id',
            'estate_id' => 'nullable|exists:estates,id',
            'tagline' => 'nullable|string|max:255',
            'house_type' => 'required|string',
            'short_description' => 'nullable|string|max:500',
            'description' => 'required|string',
            'address' => 'required|string',
            'hero_image' => 'nullable|string',
            'status' => 'required|in:active,coming_soon,members_only,archived',
            'is_featured' => 'boolean',
            'amenities' => 'nullable|array',
            'amenities.*' => 'exists:amenities,id',
        ]);

        $slug = Str::slug($validated['name']);
        $originalSlug = $slug;
        $counter = 1;
        while (House::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter++;
        }
        $validated['slug'] = $slug;

        $amenityIds = $validated['amenities'] ?? [];
        unset($validated['amenities']);

        $house = House::create($validated);
        if (! empty($amenityIds)) {
            $house->amenities()->sync($amenityIds);
        }

        $this->auditLogger->log($request->user(), 'house.created', 'House', $house->id, ['name' => $house->name]);

        return response()->json([
            'message' => 'House created successfully.',
            'data' => $house->load(['location', 'amenities']),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $house = House::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'location_id' => 'sometimes|exists:locations,id',
            'estate_id' => 'nullable|exists:estates,id',
            'tagline' => 'nullable|string|max:255',
            'house_type' => 'sometimes|string',
            'short_description' => 'nullable|string|max:500',
            'description' => 'sometimes|string',
            'address' => 'sometimes|string',
            'hero_image' => 'nullable|string',
            'status' => 'sometimes|in:active,coming_soon,members_only,archived',
            'is_featured' => 'boolean',
            'amenities' => 'nullable|array',
            'amenities.*' => 'exists:amenities,id',
        ]);

        if (isset($validated['amenities'])) {
            $house->amenities()->sync($validated['amenities']);
            unset($validated['amenities']);
        }

        $house->update($validated);

        $this->auditLogger->log($request->user(), 'house.updated', 'House', $house->id, ['name' => $house->name]);

        return response()->json([
            'message' => 'House updated successfully.',
            'data' => $house->load(['location', 'amenities']),
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
}

