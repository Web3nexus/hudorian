<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Services\Booking\AvailabilityService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends Controller
{
    protected AvailabilityService $availabilityService;

    public function __construct(AvailabilityService $availabilityService)
    {
        $this->availabilityService = $availabilityService;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Event::with(['house.location'])
            ->where('status', 'published')
            ->where('starts_at', '>=', now());

        if ($request->filled('house_id')) {
            $query->where('house_id', $request->house_id);
        }

        if ($request->filled('type')) {
            $query->where('event_type', $request->type);
        }

        $events = $query->orderBy('starts_at')->get()->map(function ($event) {
            $event->available_seats = $event->availableSeats();
            return $event;
        });

        return response()->json([
            'data' => $events,
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $event = Event::with(['house.location', 'house.amenities'])
            ->where('slug', $slug)
            ->firstOrFail();

        $event->available_seats = $event->availableSeats();

        return response()->json([
            'data' => $event,
        ]);
    }

    public function book(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'tickets_count' => 'required|integer|min:1|max:10',
        ]);

        try {
            $booking = $this->availabilityService->bookEvent(
                $request->user(),
                $id,
                $request->tickets_count
            );

            return response()->json([
                'message' => 'Event booked successfully.',
                'booking' => $booking->load(['event.house.location']),
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Reservation Failed',
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}

