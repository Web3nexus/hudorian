<?php

namespace App\Services\Membership;

use App\Models\Member;
use App\Models\MembershipApplication;
use App\Models\MembershipPlan;
use App\Models\User;
use App\Services\Audit\AuditLogger;
use App\Services\Payments\PaymentGatewayInterface;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class MembershipService
{
    protected PaymentGatewayInterface $paymentGateway;
    protected AuditLogger $auditLogger;

    public function __construct(PaymentGatewayInterface $paymentGateway, AuditLogger $auditLogger)
    {
        $this->paymentGateway = $paymentGateway;
        $this->auditLogger = $auditLogger;
    }

    /**
     * Submit or save a membership application.
     */
    public function submitApplication(array $data, ?User $currentUser = null): MembershipApplication
    {
        $plan = MembershipPlan::findOrFail($data['membership_plan_id']);

        $user = $currentUser;
        if (! $user) {
            $user = User::where('email', $data['email'])->first();
            if (! $user && ! empty($data['password'])) {
                $user = User::create([
                    'name' => $data['first_name'] . ' ' . $data['last_name'],
                    'email' => $data['email'],
                    'password' => Hash::make($data['password']),
                    'phone' => $data['phone'] ?? null,
                    'city' => $data['city'] ?? null,
                    'country' => $data['country'] ?? null,
                    'role' => 'member',
                ]);
            }
        }

        $application = MembershipApplication::create([
            'user_id' => $user?->id,
            'membership_plan_id' => $plan->id,
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'city' => $data['city'],
            'country' => $data['country'],
            'profession' => $data['profession'],
            'company' => $data['company'] ?? null,
            'bio' => $data['bio'],
            'social_profile_url' => $data['social_profile_url'] ?? null,
            'interests' => $data['interests'] ?? [],
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        $this->auditLogger->log(
            $user,
            'application.submitted',
            'MembershipApplication',
            $application->id,
            ['plan' => $plan->name, 'applicant' => $application->first_name . ' ' . $application->last_name]
        );

        return $application;
    }

    /**
     * Review an application (Approve, Reject, or Request Info).
     */
    public function reviewApplication(
        MembershipApplication $application,
        string $decision, // 'approved', 'rejected', 'under_review'
        User $reviewer,
        ?string $notes = null
    ): MembershipApplication {
        return DB::transaction(function () use ($application, $decision, $reviewer, $notes) {
            $application->update([
                'status' => $decision,
                'reviewer_id' => $reviewer->id,
                'reviewer_notes' => $notes,
                'reviewed_at' => now(),
            ]);

            // If approved, create or activate Member record
            if ($decision === 'approved') {
                $user = $application->user;
                if (! $user) {
                    $user = User::firstOrCreate(
                        ['email' => $application->email],
                        [
                            'name' => $application->first_name . ' ' . $application->last_name,
                            'password' => Hash::make(Str::random(16)),
                            'role' => 'member',
                            'phone' => $application->phone,
                            'city' => $application->city,
                            'country' => $application->country,
                        ]
                    );
                    $application->update(['user_id' => $user->id]);
                }

                $membershipNumber = 'HUD-' . date('Y') . '-' . strtoupper(Str::random(5));

                $member = Member::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'membership_plan_id' => $application->membership_plan_id,
                        'membership_number' => $membershipNumber,
                        'status' => 'active',
                        'started_at' => now(),
                        'expires_at' => now()->addYear(),
                        'internal_notes' => 'Approved by ' . $reviewer->name . ' on ' . now()->toDateString(),
                    ]
                );

                // Charge initial membership dues via payment abstraction
                $plan = $application->plan;
                if ($plan->price > 0) {
                    $this->paymentGateway->charge(
                        $user,
                        (float) $plan->price,
                        $plan->currency,
                        [
                            'payable_type' => Member::class,
                            'payable_id' => $member->id,
                            'plan_name' => $plan->name,
                            'description' => 'HUDORIAN Annual Membership Dues - ' . $plan->name,
                        ],
                        'idemp_mbr_' . $member->id . '_' . now()->year
                    );
                }
            }

            $this->auditLogger->log(
                $reviewer,
                'application.' . $decision,
                'MembershipApplication',
                $application->id,
                ['decision' => $decision, 'notes' => $notes]
            );

            return $application->fresh();
        });
    }
}

