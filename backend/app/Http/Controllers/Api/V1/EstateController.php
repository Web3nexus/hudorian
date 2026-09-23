<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Estate;
use Illuminate\Http\JsonResponse;

class EstateController extends Controller
{
    public function index(): JsonResponse
    {
        $estates = Estate::with(['location', 'houses.location', 'houses.amenities'])
            ->where('is_active', true)
            ->get();

        return response()->json([
            'data' => $estates,
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $estate = Estate::with([
            'location',
            'houses.location',
            'houses.amenities',
            'houses.rooms',
        ])->where('slug', $slug)->firstOrFail();

        return response()->json([
            'data' => $estate,
        ]);
    }
}

