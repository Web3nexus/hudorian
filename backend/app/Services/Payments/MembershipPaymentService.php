<?php

namespace App\Services\Payments;

use App\Models\Invoice;
use App\Models\Member;
use App\Models\MembershipPlan;
use App\Models\Payment;
use App\Models\User;
use App\Services\Audit\AuditLogger;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MembershipPaymentService
{
    protected AuditLogger $auditLogger;

    public function __construct(AuditLogger $auditLogger)
    {
        $this->auditLogger = $auditLogger;
    }

    /**
     * Create a payment record for membership dues.
     */
    public function recordPayment(
        User $user,
        MembershipPlan $plan,
        string $provider,
        string $status,
        string $transactionId,
        array $metadata = [],
        ?string $paymentMethod = null,
        ?float $customAmount = null,
        ?string $customCurrency = null
    ): Payment {
        $finalAmount = $customAmount !== null ? $customAmount : (float) $plan->price;
        $finalCurrency = ! empty($customCurrency) ? strtoupper($customCurrency) : strtoupper($plan->currency ?? 'EUR');

        return Payment::create([
            'transaction_id' => $transactionId,
            'user_id' => $user->id,
            'payable_type' => MembershipPlan::class,
            'payable_id' => $plan->id,
            'amount' => $finalAmount,
            'currency' => $finalCurrency,
            'provider' => $provider,
            'status' => $status,
            'payment_method' => $paymentMethod ?? ($provider === 'manual_transfer' ? 'bank_transfer' : 'card'),
            'metadata' => array_merge([
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
                'base_plan_price' => (float) $plan->price,
                'base_plan_currency' => strtoupper($plan->currency ?? 'EUR'),
                'description' => 'HUDORIAN Annual Membership Dues - ' . $plan->name,
                'user_email' => $user->email,
                'user_name' => $user->name,
            ], $metadata),
        ]);
    }

    /**
     * Submit manual bank wire transfer for admin clearance.
     */
    public function submitManualTransfer(
        User $user,
        MembershipPlan $plan,
        array $details,
        ?float $customAmount = null,
        ?string $customCurrency = null
    ): Payment {
        $transactionId = 'wire_' . Str::lower(Str::random(14));

        return $this->recordPayment(
            $user,
            $plan,
            'manual_transfer',
            'pending',
            $transactionId,
            [
                'transfer_reference' => $details['transfer_reference'] ?? $details['reference'] ?? 'WIRE-' . strtoupper(Str::random(8)),
                'sender_bank' => $details['sender_bank'] ?? null,
                'sender_account_name' => $details['sender_account_name'] ?? $user->name,
                'transfer_date' => $details['transfer_date'] ?? now()->toDateString(),
                'proof_notes' => $details['proof_notes'] ?? $details['notes'] ?? null,
                'proof_document_url' => $details['proof_document_url'] ?? null,
                'submitted_at' => now()->toIso8601String(),
            ],
            'bank_transfer',
            $customAmount,
            $customCurrency
        );
    }

    /**
     * Complete and activate membership from a verified payment (Flutterwave or Paystack).
     */
    public function completeOnlinePayment(Payment $payment, array $verificationData): Payment
    {
        return DB::transaction(function () use ($payment, $verificationData) {
            $payment->update([
                'status' => 'paid',
                'metadata' => array_merge($payment->metadata ?? [], [
                    'gateway_verification' => $verificationData,
                    'verified_at' => now()->toIso8601String(),
                ]),
            ]);

            // Issue invoice and activate or extend membership
            $this->activateOrRenewMember($payment);

            $this->auditLogger->log(
                $payment->user,
                'payment.online_succeeded',
                'Payment',
                $payment->id,
                [
                    'provider' => $payment->provider,
                    'amount' => $payment->amount,
                    'currency' => $payment->currency,
                    'transaction_id' => $payment->transaction_id,
                ]
            );

            return $payment->fresh();
        });
    }

    /**
     * Approve a pending manual payment (Admin Clearance).
     */
    public function approveManualPayment(Payment $payment, User $adminUser, ?string $adminNotes = null): Payment
    {
        if ($payment->status === 'paid') {
            return $payment;
        }

        return DB::transaction(function () use ($payment, $adminUser, $adminNotes) {
            $meta = $payment->metadata ?? [];
            $meta['approved_by'] = [
                'id' => $adminUser->id,
                'name' => $adminUser->name,
                'email' => $adminUser->email,
            ];
            $meta['approved_at'] = now()->toIso8601String();
            if ($adminNotes) {
                $meta['admin_approval_notes'] = $adminNotes;
            }

            $payment->update([
                'status' => 'paid',
                'metadata' => $meta,
            ]);

            // Issue invoice and activate or extend membership
            $this->activateOrRenewMember($payment);

            $this->auditLogger->log(
                $adminUser,
                'payment.manual_approved',
                'Payment',
                $payment->id,
                [
                    'member_email' => $payment->user?->email,
                    'amount' => $payment->amount,
                    'currency' => $payment->currency,
                    'transaction_id' => $payment->transaction_id,
                    'admin_notes' => $adminNotes,
                ]
            );

            return $payment->fresh();
        });
    }

    /**
     * Reject a pending manual payment.
     */
    public function rejectManualPayment(Payment $payment, User $adminUser, string $reason): Payment
    {
        return DB::transaction(function () use ($payment, $adminUser, $reason) {
            $meta = $payment->metadata ?? [];
            $meta['rejected_by'] = [
                'id' => $adminUser->id,
                'name' => $adminUser->name,
            ];
            $meta['rejected_at'] = now()->toIso8601String();
            $meta['rejection_reason'] = $reason;

            $payment->update([
                'status' => 'rejected',
                'metadata' => $meta,
            ]);

            $this->auditLogger->log(
                $adminUser,
                'payment.manual_rejected',
                'Payment',
                $payment->id,
                [
                    'reason' => $reason,
                    'transaction_id' => $payment->transaction_id,
                ]
            );

            return $payment->fresh();
        });
    }

    /**
     * Activate or extend member record and issue invoice.
     */
    public function activateOrRenewMember(Payment $payment): void
    {
        $user = $payment->user;
        if (! $user) {
            return;
        }

        // Determine plan
        $planId = $payment->payable_id ?? $payment->metadata['plan_id'] ?? null;
        $plan = $planId ? MembershipPlan::find($planId) : null;
        if (! $plan) {
            $plan = MembershipPlan::orderBy('price')->first();
        }

        $member = Member::where('user_id', $user->id)->first();

        if ($member) {
            // Member exists - renew or extend
            $expiresAt = ($member->expires_at && $member->expires_at->isFuture())
                ? $member->expires_at->copy()->addYear()
                : now()->addYear();

            $member->update([
                'membership_plan_id' => $plan->id,
                'status' => 'active',
                'expires_at' => $expiresAt,
            ]);
        } else {
            // New membership activation
            $membershipNumber = 'HUD-' . date('Y') . '-' . strtoupper(Str::random(5));
            Member::create([
                'user_id' => $user->id,
                'membership_plan_id' => $plan->id,
                'membership_number' => $membershipNumber,
                'status' => 'active',
                'started_at' => now(),
                'expires_at' => now()->addYear(),
                'internal_notes' => 'Activated via ' . strtoupper($payment->provider) . ' payment ' . $payment->transaction_id,
            ]);
        }

        // Ensure Invoice exists
        if (! Invoice::where('payment_id', $payment->id)->exists()) {
            $invoiceNumber = 'INV-' . date('Y') . '-' . strtoupper(Str::random(8));
            Invoice::create([
                'invoice_number' => $invoiceNumber,
                'payment_id' => $payment->id,
                'user_id' => $user->id,
                'amount' => $payment->amount,
                'currency' => $payment->currency,
                'status' => 'paid',
                'pdf_url' => '/api/v1/invoices/' . $invoiceNumber . '/pdf',
                'issued_at' => now(),
            ]);
        }
    }
}

