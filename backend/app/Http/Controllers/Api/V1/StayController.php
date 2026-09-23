<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Services\Booking\AvailabilityService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StayController extends Controller
{
    protected AvailabilityService $availabilityService;

    public function __construct(AvailabilityService $availabilityService)
    {
        $this->availabilityService = $availabilityService;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Room::with(['house.location', 'amenities', 'media'])
            ->where('status', 'active');

        if ($request->filled('house_id')) {
            $query->where('house_id', $request->house_id);
        }

        if ($request->filled('guests')) {
            $query->where('capacity', '>=', (int) $request->guests);
        }

        if ($request->filled('room_type')) {
            $query->where('room_type', $request->room_type);
        }

        $rooms = $query->get();

        // If dates are provided, filter out unavailable rooms
        if ($request->filled(['check_in', 'check_out'])) {
            $rooms = $rooms->filter(function ($room) use ($request) {
                return $this->availabilityService->isRoomAvailable(
                    $room->id,
                    $request->check_in,
                    $request->check_out
                );
            })->values();
        }

        return response()->json([
            'data' => $rooms,
            'count' => $rooms->count(),
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $room = Room::with(['house.location', 'house.amenities', 'amenities', 'media'])
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json([
            'data' => $room,
        ]);
    }

    public function checkAvailability(Request $request): JsonResponse
    {
        $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
        ]);

        $available = $this->availabilityService->isRoomAvailable(
            $request->room_id,
            $request->check_in,
            $request->check_out
        );

        return response()->json([
            'available' => $available,
            'room_id' => $request->room_id,
            'check_in' => $request->check_in,
            'check_out' => $request->check_out,
        ]);
    }

    public function book(Request $request): JsonResponse
    {
        $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'guests_count' => 'required|integer|min:1',
            'special_requests' => 'nullable|string|max:1000',
        ]);

        try {
            $reservation = $this->availabilityService->bookRoom(
                $request->user(),
                $request->room_id,
                $request->check_in,
                $request->check_out,
                $request->guests_count,
                $request->special_requests
            );

            return response()->json([
                'message' => 'Reservation confirmed successfully.',
                'reservation' => $reservation->load(['room.house.location', 'user']),
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Booking Failed',
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}

