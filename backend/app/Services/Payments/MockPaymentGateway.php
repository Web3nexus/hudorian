<?php

namespace App\Services\Payments;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\User;
use App\Services\Audit\AuditLogger;
use Illuminate\Support\Str;

class MockPaymentGateway implements PaymentGatewayInterface
{
    protected AuditLogger $auditLogger;

    public function __construct(AuditLogger $auditLogger)
    {
        $this->auditLogger = $auditLogger;
    }

    public function charge(
        User $user,
        float $amount,
        string $currency = 'EUR',
        array $metadata = [],
        ?string $idempotencyKey = null
    ): Payment {
        // Idempotency check to avoid double charging
        if ($idempotencyKey) {
            $existing = Payment::where('idempotency_key', $idempotencyKey)->first();
            if ($existing) {
                return $existing;
            }
        }

        $transactionId = 'tx_hud_' . Str::lower(Str::random(16));

        $payment = Payment::create([
            'transaction_id' => $transactionId,
            'user_id' => $user->id,
            'payable_type' => $metadata['payable_type'] ?? null,
            'payable_id' => $metadata['payable_id'] ?? null,
            'amount' => $amount,
            'currency' => strtoupper($currency),
            'provider' => 'hudorian_pay_vault',
            'status' => 'paid',
            'payment_method' => $metadata['payment_method'] ?? 'card_exclusive',
            'idempotency_key' => $idempotencyKey,
            'metadata' => $metadata,
        ]);

        // Automatically issue an invoice
        $invoiceNumber = 'INV-' . date('Y') . '-' . strtoupper(Str::random(8));
        Invoice::create([
            'invoice_number' => $invoiceNumber,
            'payment_id' => $payment->id,
            'user_id' => $user->id,
            'amount' => $amount,
            'currency' => strtoupper($currency),
            'status' => 'paid',
            'pdf_url' => '/api/v1/invoices/' . $invoiceNumber . '/pdf',
            'issued_at' => now(),
        ]);

        $this->auditLogger->log(
            $user,
            'payment.succeeded',
            'Payment',
            $payment->id,
            ['amount' => $amount, 'currency' => $currency, 'transaction_id' => $transactionId]
        );

        return $payment;
    }

    public function refund(Payment $payment, ?float $amount = null, ?string $reason = null): bool
    {
        $refundAmount = $amount ?? $payment->amount;

        $refundId = 'ref_' . Str::lower(Str::random(16));

        Refund::create([
            'refund_id' => $refundId,
            'payment_id' => $payment->id,
            'amount' => $refundAmount,
            'currency' => $payment->currency,
            'reason' => $reason ?? 'Member requested refund',
            'status' => 'completed',
        ]);

        $payment->update([
            'status' => ($refundAmount >= $payment->amount) ? 'refunded' : 'partially_refunded',
        ]);

        $this->auditLogger->log(
            $payment->user,
            'payment.refunded',
            'Payment',
            $payment->id,
            ['amount' => $refundAmount, 'refund_id' => $refundId, 'reason' => $reason]
        );

        return true;
    }

    public function verifyWebhook(string $payload, string $signature): bool
    {
        return true;
    }
}

