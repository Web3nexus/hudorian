<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Services\Audit\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminRoomController extends Controller
{
    protected AuditLogger $auditLogger;

    public function __construct(AuditLogger $auditLogger)
    {
        $this->auditLogger = $auditLogger;
    }

    public function index(): JsonResponse
    {
        $rooms = Room::with(['house.location', 'amenities'])->get();

        return response()->json([
            'data' => $rooms,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'house_id' => 'required|exists:houses,id',
            'name' => 'required|string|max:255',
            'room_type' => 'required|string',
            'description' => 'required|string',
            'capacity' => 'required|integer|min:1',
            'base_price_per_night' => 'required|numeric|min:0',
            'currency' => 'required|string|size:3',
            'size_sqm' => 'nullable|integer',
            'hero_image' => 'nullable|string',
            'status' => 'required|in:active,maintenance',
        ]);

        $validated['slug'] = Str::slug($validated['name']) . '-' . Str::random(5);

        $room = Room::create($validated);

        $this->auditLogger->log($request->user(), 'room.created', 'Room', $room->id, ['name' => $room->name]);

        return response()->json([
            'message' => 'Room created successfully.',
            'data' => $room->load('house'),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $room = Room::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'room_type' => 'sometimes|string',
            'description' => 'sometimes|string',
            'capacity' => 'sometimes|integer|min:1',
            'base_price_per_night' => 'sometimes|numeric|min:0',
            'size_sqm' => 'nullable|integer',
            'hero_image' => 'nullable|string',
            'status' => 'sometimes|in:active,maintenance',
        ]);

        $room->update($validated);

        $this->auditLogger->log($request->user(), 'room.updated', 'Room', $room->id, ['name' => $room->name]);

        return response()->json([
            'message' => 'Room updated successfully.',
            'data' => $room->load('house'),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $room = Room::findOrFail($id);
        $name = $room->name;
        $room->delete();

        $this->auditLogger->log($request->user(), 'room.deleted', 'Room', $id, ['name' => $name]);

        return response()->json([
            'message' => 'Room deleted successfully.',
        ]);
    }
}

