<?php

namespace App\Services\Payments;

use App\Models\Payment;
use App\Models\User;

interface PaymentGatewayInterface
{
    /**
     * Charge a payment for a membership, stay, or event.
     *
     * @param User $user
     * @param float $amount
     * @param string $currency
     * @param array $metadata
     * @param string|null $idempotencyKey
     * @return Payment
     */
    public function charge(
        User $user,
        float $amount,
        string $currency = 'EUR',
        array $metadata = [],
        ?string $idempotencyKey = null
    ): Payment;

    /**
     * Process a refund for a prior payment.
     *
     * @param Payment $payment
     * @param float|null $amount
     * @param string|null $reason
     * @return bool
     */
    public function refund(Payment $payment, ?float $amount = null, ?string $reason = null): bool;

    /**
     * Verify a webhook event signature from the payment provider.
     *
     * @param string $payload
     * @param string $signature
     * @return bool
     */
    public function verifyWebhook(string $payload, string $signature): bool;
}

