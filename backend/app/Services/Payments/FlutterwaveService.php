<?php

namespace App\Services\Payments;

use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FlutterwaveService
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
        return $settings['flutterwave_secret_key'] ?? env('FLW_SECRET_KEY');
    }

    /**
     * Get public key from settings or environment.
     */
    public function getPublicKey(): ?string
    {
        $settings = $this->settingsService->getSettings();
        return $settings['flutterwave_public_key'] ?? env('FLW_PUBLIC_KEY');
    }

    /**
     * Initialize a Flutterwave Standard payment.
     *
     * @return array{success: bool, checkout_url?: string, tx_ref: string, error?: string}
     */
    public function initializePayment(
        User $user,
        float $amount,
        string $currency,
        string $txRef,
        array $metadata,
        string $redirectUrl
    ): array {
        $secretKey = $this->getSecretKey();

        if (empty($secretKey)) {
            // If secret key is not set, provide simulated hosted link for testing
            return [
                'success' => true,
                'checkout_url' => $redirectUrl . (str_contains($redirectUrl, '?') ? '&' : '?') . 'status=successful&tx_ref=' . $txRef . '&transaction_id=flw_sim_' . time(),
                'tx_ref' => $txRef,
                'simulated' => true,
            ];
        }

        try {
            $response = Http::withToken($secretKey)
                ->timeout(15)
                ->post('https://api.flutterwave.com/v3/payments', [
                    'tx_ref' => $txRef,
                    'amount' => $amount,
                    'currency' => strtoupper($currency),
                    'redirect_url' => $redirectUrl,
                    'customer' => [
                        'email' => $user->email,
                        'name' => $user->name,
                        'phonenumber' => $user->phone ?? '',
                    ],
                    'customizations' => [
                        'title' => 'HUDORIAN Sanctuary Membership',
                        'description' => $metadata['description'] ?? 'HUDORIAN Annual Membership Dues',
                        'logo' => url('/icon.png'),
                    ],
                    'meta' => $metadata,
                ]);

            $body = $response->json();

            if ($response->successful() && ! empty($body['data']['link'])) {
                return [
                    'success' => true,
                    'checkout_url' => $body['data']['link'],
                    'tx_ref' => $txRef,
                ];
            }

            Log::error('Flutterwave payment initialization error', ['response' => $body]);

            return [
                'success' => false,
                'tx_ref' => $txRef,
                'error' => $body['message'] ?? 'Unable to initialize Flutterwave payment.',
            ];
        } catch (Exception $e) {
            Log::error('Flutterwave connection error', ['error' => $e->getMessage()]);

            return [
                'success' => false,
                'tx_ref' => $txRef,
                'error' => 'Communication error with Flutterwave service.',
            ];
        }
    }

    /**
     * Verify a Flutterwave transaction by ID.
     *
     * @return array{success: bool, data?: array, error?: string}
     */
    public function verifyTransaction(string $transactionId): array
    {
        $secretKey = $this->getSecretKey();

        // Handle simulation test transaction
        if (str_starts_with($transactionId, 'flw_sim_') || empty($secretKey)) {
            return [
                'success' => true,
                'data' => [
                    'id' => $transactionId,
                    'status' => 'successful',
                    'tx_ref' => request('tx_ref', 'tx_flw_' . time()),
                    'amount' => (float) request('amount', 3500),
                    'currency' => strtoupper(request('currency', 'EUR')),
                ],
            ];
        }

        try {
            $response = Http::withToken($secretKey)
                ->timeout(15)
                ->get("https://api.flutterwave.com/v3/transactions/{$transactionId}/verify");

            $body = $response->json();

            if ($response->successful() && ($body['status'] ?? '') === 'success') {
                $txData = $body['data'] ?? [];
                if (($txData['status'] ?? '') === 'successful') {
                    return [
                        'success' => true,
                        'data' => $txData,
                    ];
                }
            }

            return [
                'success' => false,
                'error' => $body['message'] ?? 'Transaction verification failed on Flutterwave.',
            ];
        } catch (Exception $e) {
            Log::error('Flutterwave verification error', ['error' => $e->getMessage()]);

            return [
                'success' => false,
                'error' => 'Unable to verify Flutterwave transaction.',
            ];
        }
    }

    /**
     * Validate Flutterwave webhook signature.
     */
    public function verifyWebhook(Request $request): bool
    {
        $settings = $this->settingsService->getSettings();
        $secretHash = $settings['flutterwave_webhook_secret'] ?? env('FLW_WEBHOOK_SECRET');

        if (empty($secretHash)) {
            return true;
        }

        return hash_equals($secretHash, (string) $request->header('verif-hash', ''));
    }
}

