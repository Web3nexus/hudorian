<?php

namespace App\Services\Membership;

use App\Models\Member;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Str;

class DigitalCardService
{
    protected string $secret;

    public function __construct()
    {
        $this->secret = config('app.key') ?: 'hudorian-card-vault-secret';
    }

    /**
     * Generate a short-lived secure QR payload and verification token for a member.
     */
    public function generateCardToken(Member $member): array
    {
        $expiresAt = now()->addMinutes(15);
        $nonce = Str::random(16);

        $payload = [
            'mid' => $member->id,
            'num' => $member->membership_number,
            'exp' => $expiresAt->timestamp,
            'nonce' => $nonce,
        ];

        $encodedPayload = base64_encode(json_encode($payload));
        $signature = hash_hmac('sha256', $encodedPayload, $this->secret);

        $token = $encodedPayload . '.' . $signature;

        $member->update([
            'card_verification_token' => $signature,
            'card_token_expires_at' => $expiresAt,
        ]);

        return [
            'token' => $token,
            'expires_at' => $expiresAt->toIso8601String(),
            'verify_url' => url('/api/v1/verify-card/' . $token),
        ];
    }

    /**
     * Verify a digital card token presented at club check-in or house concierge.
     */
    public function verifyCardToken(string $token): array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 2) {
            return [
                'valid' => false,
                'status' => 'invalid_format',
                'message' => 'Malformed card token.',
            ];
        }

        [$encodedPayload, $signature] = $parts;
        $expectedSignature = hash_hmac('sha256', $encodedPayload, $this->secret);

        if (! hash_equals($expectedSignature, $signature)) {
            return [
                'valid' => false,
                'status' => 'tampered',
                'message' => 'Digital membership card signature is invalid or forged.',
            ];
        }

        $payload = json_decode(base64_decode($encodedPayload), true);
        if (! $payload || ! isset($payload['mid'], $payload['exp'])) {
            return [
                'valid' => false,
                'status' => 'corrupted',
                'message' => 'Invalid token payload.',
            ];
        }

        if (now()->timestamp > $payload['exp']) {
            return [
                'valid' => false,
                'status' => 'expired',
                'message' => 'This digital pass has expired. Please refresh the card in the member app.',
            ];
        }

        $member = Member::with(['user', 'plan'])->find($payload['mid']);
        if (! $member) {
            return [
                'valid' => false,
                'status' => 'not_found',
                'message' => 'Member profile not found.',
            ];
        }

        if (! $member->isActive()) {
            return [
                'valid' => false,
                'status' => 'inactive',
                'message' => 'Membership status is ' . $member->status . '.',
                'member' => [
                    'name' => $member->user->name,
                    'number' => $member->membership_number,
                    'status' => $member->status,
                ],
            ];
        }

        return [
            'valid' => true,
            'status' => 'active',
            'message' => 'Verified HUDORIAN Member Access Granted.',
            'member' => [
                'id' => $member->id,
                'name' => $member->user->name,
                'number' => $member->membership_number,
                'plan_name' => $member->plan->name,
                'house_access' => $member->plan->house_access_type,
                'guest_allowance' => $member->plan->guest_allowance,
                'expires_at' => $member->expires_at?->toDateString(),
            ],
        ];
    }
}

