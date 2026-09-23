<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\MembershipApplication;
use App\Services\Membership\MembershipService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminApplicationController extends Controller
{
    protected MembershipService $membershipService;

    public function __construct(MembershipService $membershipService)
    {
        $this->membershipService = $membershipService;
    }

    public function index(Request $request): JsonResponse
    {
        $query = MembershipApplication::with(['plan', 'reviewer']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $applications = $query->orderByDesc('created_at')->paginate(20);

        return response()->json($applications);
    }

    public function show(int $id): JsonResponse
    {
        $application = MembershipApplication::with(['plan', 'reviewer', 'user'])
            ->findOrFail($id);

        return response()->json([
            'data' => $application,
        ]);
    }

    public function review(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'decision' => 'required|in:approved,rejected,under_review',
            'notes' => 'nullable|string',
        ]);

        $application = MembershipApplication::findOrFail($id);

        try {
            $updated = $this->membershipService->reviewApplication(
                $application,
                $request->decision,
                $request->user(),
                $request->notes
            );

            return response()->json([
                'message' => 'Application reviewed: ' . ucfirst($request->decision),
                'data' => $updated->load(['plan', 'reviewer', 'user.member']),
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Review Failed',
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}

