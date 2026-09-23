<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\MembershipPlan;
use App\Services\Membership\DigitalCardService;
use App\Services\Membership\MembershipService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MembershipController extends Controller
{
    protected MembershipService $membershipService;
    protected DigitalCardService $digitalCardService;

    public function __construct(
        MembershipService $membershipService,
        DigitalCardService $digitalCardService
    ) {
        $this->membershipService = $membershipService;
        $this->digitalCardService = $digitalCardService;
    }

    public function plans(): JsonResponse
    {
        $plans = MembershipPlan::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('price')
            ->get();

        return response()->json([
            'data' => $plans,
        ]);
    }

    public function apply(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'membership_plan_id' => 'required|exists:membership_plans,id',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|max:255',
            'password' => 'nullable|string|min:8',
            'phone' => 'nullable|string|max:30',
            'city' => 'required|string|max:100',
            'country' => 'required|string|max:100',
            'profession' => 'required|string|max:150',
            'company' => 'nullable|string|max:150',
            'bio' => 'required|string|max:2000',
            'social_profile_url' => 'nullable|string|max:255',
            'interests' => 'nullable|array',
        ]);

        try {
            $application = $this->membershipService->submitApplication(
                $validated,
                $request->user()
            );

            return response()->json([
                'message' => 'Thank you for your application to HUDORIAN. Our Membership Committee will review your candidacy.',
                'application' => [
                    'id' => $application->id,
                    'status' => $application->status,
                    'submitted_at' => $application->submitted_at,
                ],
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Application Submission Failed',
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function card(Request $request): JsonResponse
    {
        $user = $request->user();
        $member = $user->member;

        if (! $member) {
            return response()->json([
                'error' => 'Not a member',
                'message' => 'You do not have an active HUDORIAN membership.',
            ], 404);
        }

        $cardData = $this->digitalCardService->generateCardToken($member);

        return response()->json([
            'member' => [
                'name' => $user->name,
                'membership_number' => $member->membership_number,
                'plan_name' => $member->plan->name,
                'status' => $member->status,
                'expires_at' => $member->expires_at?->toDateString(),
            ],
            'card' => $cardData,
        ]);
    }

    public function verifyCard(string $token): JsonResponse
    {
        $result = $this->digitalCardService->verifyCardToken($token);

        $status = $result['valid'] ? 200 : 400;

        return response()->json($result, $status);
    }
}

