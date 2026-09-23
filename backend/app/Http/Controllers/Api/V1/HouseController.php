<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\House;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HouseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = House::with(['location', 'amenities', 'estate'])
            ->where('status', '!=', 'archived');

        if ($request->filled('location')) {
            $query->whereHas('location', function ($q) use ($request) {
                $q->where('slug', $request->location)
                  ->orWhere('country', 'like', '%' . $request->location . '%');
            });
        }

        if ($request->filled('type')) {
            $query->where('house_type', $request->type);
        }

        if ($request->filled('featured')) {
            $query->where('is_featured', true);
        }

        $houses = $query->orderBy('sort_order')->orderBy('name')->get();

        return response()->json([
            'data' => $houses,
            'total' => $houses->count(),
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $house = House::with([
            'location',
            'estate',
            'amenities',
            'media',
            'rooms.amenities',
            'rooms.media',
            'events' => function ($q) {
                $q->where('starts_at', '>=', now())
                  ->where('status', 'published')
                  ->orderBy('starts_at');
            },
        ])->where('slug', $slug)->firstOrFail();

        return response()->json([
            'data' => $house,
        ]);
    }
}

