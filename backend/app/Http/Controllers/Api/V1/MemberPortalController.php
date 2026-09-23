<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\EventBooking;
use App\Models\Payment;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MemberPortalController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user()->load(['member.plan']);

        $upcomingReservations = Reservation::with(['room.house.location'])
            ->where('user_id', $user->id)
            ->where('check_out', '>=', now()->toDateString())
            ->where('status', '!=', 'cancelled')
            ->orderBy('check_in')
            ->limit(3)
            ->get();

        $upcomingEvents = EventBooking::with(['event.house.location'])
            ->where('user_id', $user->id)
            ->whereHas('event', function ($q) {
                $q->where('starts_at', '>=', now());
            })
            ->where('status', 'confirmed')
            ->limit(3)
            ->get();

        return response()->json([
            'member' => $user->member,
            'plan' => $user->member?->plan,
            'upcoming_stays' => $upcomingReservations,
            'upcoming_events' => $upcomingEvents,
            'stats' => [
                'total_stays' => Reservation::where('user_id', $user->id)->count(),
                'total_events' => EventBooking::where('user_id', $user->id)->count(),
                'active_days' => $user->member?->started_at ? now()->diffInDays($user->member->started_at) : 0,
            ],
        ]);
    }

    public function bookings(Request $request): JsonResponse
    {
        $user = $request->user();

        $reservations = Reservation::with(['room.house.location'])
            ->where('user_id', $user->id)
            ->orderByDesc('check_in')
            ->get();

        $events = EventBooking::with(['event.house.location'])
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'stays' => $reservations,
            'events' => $events,
        ]);
    }

    public function payments(Request $request): JsonResponse
    {
        $user = $request->user();

        $payments = Payment::with(['invoices', 'refunds'])
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'data' => $payments,
        ]);
    }
}

