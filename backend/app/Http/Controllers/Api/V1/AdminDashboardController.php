<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\House;
use App\Models\Member;
use App\Models\MembershipApplication;
use App\Models\Payment;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $totalMembers = Member::count();
        $activeMembers = Member::where('status', 'active')->count();
        $pendingApplications = MembershipApplication::whereIn('status', ['submitted', 'under_review'])->count();
        $totalRevenue = (float) Payment::where('status', 'paid')->sum('amount');
        $totalHouses = House::count();
        $totalReservations = Reservation::where('status', 'confirmed')->count();
        $upcomingEvents = Event::where('status', 'published')->where('starts_at', '>=', now())->count();

        // Recent membership applications
        $recentApplications = MembershipApplication::with('plan')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        // Recent stay reservations
        $recentReservations = Reservation::with(['user', 'room.house'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        $monthlyRevenue = (float) Payment::where('status', 'paid')
            ->where('created_at', '>=', now()->startOfMonth())
            ->sum('amount');
        if ($monthlyRevenue == 0 && $totalRevenue > 0) {
            $monthlyRevenue = $totalRevenue;
        }

        return response()->json([
            'metrics' => [
                'total_members' => $totalMembers,
                'active_members' => $activeMembers,
                'pending_applications' => $pendingApplications,
                'total_revenue' => $totalRevenue,
                'monthly_revenue' => $monthlyRevenue,
                'total_houses' => $totalHouses,
                'total_reservations' => $totalReservations,
                'upcoming_events' => $upcomingEvents,
            ],
            'total_members' => $totalMembers,
            'active_members' => $activeMembers,
            'pending_applications' => $pendingApplications,
            'total_revenue' => $totalRevenue,
            'monthly_revenue' => $monthlyRevenue,
            'total_houses' => $totalHouses,
            'total_reservations' => $totalReservations,
            'upcoming_events' => $upcomingEvents,
            'recent_applications' => $recentApplications,
            'recent_reservations' => $recentReservations,
        ]);
    }
}

