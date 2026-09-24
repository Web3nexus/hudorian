<?php

namespace App\Services\Payments;

use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaystackService
{
    protected PaymentSettingsService $settingsService;

    public function __construct(PaymentSettingsService $settingsService)
    {
        $this->settingsService = $settingsService;
    }

    /**
     * Get secret key from settings or environment.
     */
    protected function getSecretKey(): ?string
    {
        $settings = $this->settingsService->getSettings();
        return $settings['paystack_secret_key'] ?? env('PAYSTACK_SECRET_KEY');
    }

    /**
     * Get public key from settings or environment.
     */
    public function getPublicKey(): ?string
    {
        $settings = $this->settingsService->getSettings();
        return $settings['paystack_public_key'] ?? env('PAYSTACK_PUBLIC_KEY');
    }

    /**
     * Initialize a Paystack transaction.
     *
     * @return array{success: bool, authorization_url?: string, access_code?: string, reference: string, error?: string}
     */
    public function initializePayment(
        User $user,
        float $amount,
        string $currency,
        string $reference,
        array $metadata,
        string $redirectUrl
    ): array {
        $secretKey = $this->getSecretKey();

        if (empty($secretKey)) {
            // Simulated transaction URL for testing or staging
            return [
                'success' => true,
                'authorization_url' => $redirectUrl . (str_contains($redirectUrl, '?') ? '&' : '?') . 'status=success&reference=' . $reference . '&trxref=' . $reference,
                'access_code' => 'pstk_code_' . time(),
                'reference' => $reference,
                'simulated' => true,
            ];
        }

        try {
            // Paystack requires amount in lowest currency denomination (cents/kobo)
            $amountInSubunits = (int) round($amount * 100);

            $response = Http::withToken($secretKey)
                ->timeout(15)
                ->post('https://api.paystack.co/transaction/initialize', [
                    'email' => $user->email,
                    'amount' => $amountInSubunits,
                    'currency' => strtoupper($currency),
                    'reference' => $reference,
                    'callback_url' => $redirectUrl,
                    'metadata' => array_merge($metadata, [
                        'custom_fields' => [
                            [
                                'display_name' => 'Member Name',
                                'variable_name' => 'member_name',
                                'value' => $user->name,
                            ],
                            [
                                'display_name' => 'Membership Dossier',
                                'variable_name' => 'dossier',
                                'value' => $metadata['plan_name'] ?? 'HUDORIAN Patronage',
                            ],
                        ],
                    ]),
                ]);

            $body = $response->json();

            if ($response->successful() && ! empty($body['status']) && ! empty($body['data']['authorization_url'])) {
                return [
                    'success' => true,
                    'authorization_url' => $body['data']['authorization_url'],
                    'access_code' => $body['data']['access_code'] ?? null,
                    'reference' => $reference,
                ];
            }

            Log::error('Paystack initialization error', ['response' => $body]);

            return [
                'success' => false,
                'reference' => $reference,
                'error' => $body['message'] ?? 'Unable to initialize Paystack payment.',
            ];
        } catch (Exception $e) {
            Log::error('Paystack connection error', ['error' => $e->getMessage()]);

            return [
                'success' => false,
                'reference' => $reference,
                'error' => 'Communication error with Paystack service.',
            ];
        }
    }

    /**
     * Verify a Paystack transaction by reference.
     *
     * @return array{success: bool, data?: array, error?: string}
     */
    public function verifyTransaction(string $reference): array
    {
        $secretKey = $this->getSecretKey();

        // Handle simulation test transaction
        if (str_starts_with($reference, 'pstk_sim_') || empty($secretKey)) {
            return [
                'success' => true,
                'data' => [
                    'reference' => $reference,
                    'status' => 'success',
                    'amount' => (float) request('amount', 3500) * 100,
                    'currency' => strtoupper(request('currency', 'EUR')),
                    'channel' => 'card',
                ],
            ];
        }

        try {
            $response = Http::withToken($secretKey)
                ->timeout(15)
                ->get("https://api.paystack.co/transaction/verify/{$reference}");

            $body = $response->json();

            if ($response->successful() && ! empty($body['status'])) {
                $txData = $body['data'] ?? [];
                if (($txData['status'] ?? '') === 'success') {
                    return [
                        'success' => true,
                        'data' => $txData,
                    ];
                }
            }

            return [
                'success' => false,
                'error' => $body['message'] ?? 'Transaction verification failed on Paystack.',
            ];
        } catch (Exception $e) {
            Log::error('Paystack verification error', ['error' => $e->getMessage()]);

            return [
                'success' => false,
                'error' => 'Unable to verify Paystack transaction.',
            ];
        }
    }

    /**
     * Validate Paystack webhook signature (HMAC-SHA512).
     */
    public function verifyWebhook(Request $request): bool
    {
        $secretKey = $this->getSecretKey();

        if (empty($secretKey)) {
            return true;
        }

        $signature = (string) $request->header('x-paystack-signature', '');
        $computed = hash_hmac('sha512', $request->getContent(), $secretKey);

        return hash_equals($computed, $signature);
    }
}
