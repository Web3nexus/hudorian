<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\MembershipPlan;
use App\Models\Payment;
use App\Models\User;
use App\Services\Currency\CurrencyRateService;
use App\Services\Payments\FlutterwaveService;
use App\Services\Payments\MembershipPaymentService;
use App\Services\Payments\PaymentSettingsService;
use App\Services\Payments\PaystackService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    protected PaymentSettingsService $settingsService;
    protected FlutterwaveService $flutterwaveService;
    protected PaystackService $paystackService;
    protected MembershipPaymentService $membershipPaymentService;
    protected CurrencyRateService $currencyRateService;

    public function __construct(
        PaymentSettingsService $settingsService,
        FlutterwaveService $flutterwaveService,
        PaystackService $paystackService,
        MembershipPaymentService $membershipPaymentService,
        CurrencyRateService $currencyRateService
    ) {
        $this->settingsService = $settingsService;
        $this->flutterwaveService = $flutterwaveService;
        $this->paystackService = $paystackService;
        $this->membershipPaymentService = $membershipPaymentService;
        $this->currencyRateService = $currencyRateService;
    }

    /**
     * Get public payment gateway configuration.
     */
    public function config(): JsonResponse
    {
        return response()->json([
            'data' => $this->settingsService->getPublicConfig(),
        ]);
    }

    /**
     * Initialize membership payment via Flutterwave, Paystack, or Manual Transfer.
     */
    public function initialize(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'gateway' => 'required|in:flutterwave,paystack,manual',
            'membership_plan_id' => 'required|exists:membership_plans,id',
            'redirect_url' => 'nullable|url',
            'currency' => 'nullable|string|in:EUR,NGN,USD,GBP,eur,ngn,usd,gbp',
            // Guest applicant details if not authenticated
            'email' => 'nullable|email|max:255',
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:30',
            // Manual payment details
            'transfer_reference' => 'nullable|string|max:100',
            'sender_bank' => 'nullable|string|max:100',
            'sender_account_name' => 'nullable|string|max:150',
            'transfer_date' => 'nullable|date',
            'proof_notes' => 'nullable|string|max:1000',
        ]);

        $plan = MembershipPlan::findOrFail($validated['membership_plan_id']);
        $gateway = $validated['gateway'];
        $baseCurrency = strtoupper($plan->currency ?? 'EUR');
        $targetCurrency = ! empty($validated['currency']) ? strtoupper($validated['currency']) : $baseCurrency;

        // Perform currency conversion using the selected gateway's conversion engine
        $conversion = $this->currencyRateService->convert(
            (float) $plan->price,
            $baseCurrency,
            $targetCurrency,
            $gateway
        );

        $finalAmount = (float) $conversion['target_amount'];
        $finalCurrency = (string) $conversion['target_currency'];
        $exchangeRate = (float) $conversion['rate'];
        $rateProvider = (string) $conversion['provider'];

        // Resolve or create user
        $user = $request->user();
        if (! $user) {
            if (empty($validated['email'])) {
                return response()->json([
                    'error' => 'Authentication Required',
                    'message' => 'Please provide an email address or log in to initiate payment.',
                ], 422);
            }

            $user = User::firstOrCreate(
                ['email' => $validated['email']],
                [
                    'name' => $validated['name'] ?? explode('@', $validated['email'])[0],
                    'password' => Hash::make(Str::random(16)),
                    'phone' => $validated['phone'] ?? null,
                    'role' => 'member',
                ]
            );
        }

        $redirectUrl = $validated['redirect_url'] ?? url('/member/payments');

        // 1. Manual Bank Wire Transfer (ExchangeRate-API)
        if ($gateway === 'manual') {
            $payment = $this->membershipPaymentService->submitManualTransfer($user, $plan, [
                'transfer_reference' => $validated['transfer_reference'] ?? ('WIRE-' . strtoupper(Str::random(8))),
                'sender_bank' => $validated['sender_bank'] ?? null,
                'sender_account_name' => $validated['sender_account_name'] ?? $user->name,
                'transfer_date' => $validated['transfer_date'] ?? now()->toDateString(),
                'proof_notes' => $validated['proof_notes'] ?? null,
                'exchange_rate' => $exchangeRate,
                'rate_provider' => $rateProvider,
            ], $finalAmount, $finalCurrency);

            return response()->json([
                'success' => true,
                'gateway' => 'manual',
                'status' => 'pending',
                'message' => 'Your manual bank transfer has been submitted for Treasury clearance. Your membership will be activated upon confirmation.',
                'payment' => [
                    'id' => $payment->id,
                    'transaction_id' => $payment->transaction_id,
                    'amount' => $payment->amount,
                    'currency' => $payment->currency,
                    'status' => $payment->status,
                    'exchange_rate' => $exchangeRate,
                    'rate_provider' => $rateProvider,
                    'transfer_reference' => $payment->metadata['transfer_reference'] ?? null,
                ],
            ], 201);
        }

        // 2. Flutterwave Payment
        if ($gateway === 'flutterwave') {
            $txRef = 'flw_mbr_' . $user->id . '_' . time() . '_' . Str::lower(Str::random(6));

            $initResult = $this->flutterwaveService->initializePayment(
                $user,
                $finalAmount,
                $finalCurrency,
                $txRef,
                [
                    'plan_id' => $plan->id,
                    'plan_name' => $plan->name,
                    'user_id' => $user->id,
                    'exchange_rate' => $exchangeRate,
                    'rate_provider' => $rateProvider,
                ],
                $redirectUrl
            );

            if (! $initResult['success']) {
                return response()->json([
                    'error' => 'Payment Initialization Failed',
                    'message' => $initResult['error'] ?? 'Could not initialize Flutterwave payment.',
                ], 422);
            }

            // Create pending payment record
            $payment = $this->membershipPaymentService->recordPayment(
                $user,
                $plan,
                'flutterwave',
                'pending',
                $txRef,
                [
                    'checkout_url' => $initResult['checkout_url'] ?? null,
                    'exchange_rate' => $exchangeRate,
                    'rate_provider' => $rateProvider,
                ],
                'card',
                $finalAmount,
                $finalCurrency
            );

            return response()->json([
                'success' => true,
                'gateway' => 'flutterwave',
                'checkout_url' => $initResult['checkout_url'] ?? null,
                'tx_ref' => $txRef,
                'payment_id' => $payment->id,
                'amount' => $finalAmount,
                'currency' => $finalCurrency,
                'exchange_rate' => $exchangeRate,
                'rate_provider' => $rateProvider,
            ]);
        }

        // 3. Paystack Payment
        if ($gateway === 'paystack') {
            $reference = 'pstk_mbr_' . $user->id . '_' . time() . '_' . Str::lower(Str::random(6));

            $initResult = $this->paystackService->initializePayment(
                $user,
                $finalAmount,
                $finalCurrency,
                $reference,
                [
                    'plan_id' => $plan->id,
                    'plan_name' => $plan->name,
                    'user_id' => $user->id,
                    'exchange_rate' => $exchangeRate,
                    'rate_provider' => $rateProvider,
                ],
                $redirectUrl
            );

            if (! $initResult['success']) {
                return response()->json([
                    'error' => 'Payment Initialization Failed',
                    'message' => $initResult['error'] ?? 'Could not initialize Paystack payment.',
                ], 422);
            }

            // Create pending payment record
            $payment = $this->membershipPaymentService->recordPayment(
                $user,
                $plan,
                'paystack',
                'pending',
                $reference,
                [
                    'authorization_url' => $initResult['authorization_url'] ?? null,
                    'access_code' => $initResult['access_code'] ?? null,
                    'exchange_rate' => $exchangeRate,
                    'rate_provider' => $rateProvider,
                ],
                'card',
                $finalAmount,
                $finalCurrency
            );

            return response()->json([
                'success' => true,
                'gateway' => 'paystack',
                'authorization_url' => $initResult['authorization_url'] ?? null,
                'access_code' => $initResult['access_code'] ?? null,
                'reference' => $reference,
                'payment_id' => $payment->id,
                'amount' => $finalAmount,
                'currency' => $finalCurrency,
                'exchange_rate' => $exchangeRate,
                'rate_provider' => $rateProvider,
            ]);
        }

        return response()->json(['error' => 'Invalid Gateway'], 400);
    }

    /**
     * Verify payment status from Flutterwave or Paystack.
     */
    public function verify(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'gateway' => 'required|in:flutterwave,paystack',
            'reference' => 'nullable|string',
            'transaction_id' => 'nullable|string',
        ]);

        $gateway = $validated['gateway'];

        if ($gateway === 'flutterwave') {
            $txId = $validated['transaction_id'] ?? $validated['reference'];
            if (empty($txId)) {
                return response()->json(['error' => 'Transaction ID is required for verification.'], 422);
            }

            $verifyResult = $this->flutterwaveService->verifyTransaction($txId);
            if (! $verifyResult['success']) {
                return response()->json([
                    'error' => 'Verification Failed',
                    'message' => $verifyResult['error'] ?? 'Flutterwave could not verify transaction.',
                ], 422);
            }

            $txData = $verifyResult['data'] ?? [];
            $txRef = $txData['tx_ref'] ?? $txId;

            $payment = Payment::where('transaction_id', $txRef)
                ->orWhere('transaction_id', $txId)
                ->first();

            if (! $payment) {
                // If not found by txRef, look for latest pending payment for user
                $payment = Payment::where('provider', 'flutterwave')
                    ->where('status', 'pending')
                    ->latest()
                    ->first();
            }

            if ($payment) {
                $payment = $this->membershipPaymentService->completeOnlinePayment($payment, $txData);

                return response()->json([
                    'success' => true,
                    'message' => 'Payment verified successfully. Membership is now active.',
                    'payment' => $payment->load('invoices'),
                ]);
            }

            return response()->json(['success' => true, 'message' => 'Payment verified.']);
        }

        if ($gateway === 'paystack') {
            $reference = $validated['reference'] ?? $validated['transaction_id'];
            if (empty($reference)) {
                return response()->json(['error' => 'Reference is required for Paystack verification.'], 422);
            }

            $verifyResult = $this->paystackService->verifyTransaction($reference);
            if (! $verifyResult['success']) {
                return response()->json([
                    'error' => 'Verification Failed',
                    'message' => $verifyResult['error'] ?? 'Paystack could not verify transaction.',
                ], 422);
            }

            $txData = $verifyResult['data'] ?? [];

            $payment = Payment::where('transaction_id', $reference)->first();
            if (! $payment) {
                $payment = Payment::where('provider', 'paystack')
                    ->where('status', 'pending')
                    ->latest()
                    ->first();
            }

            if ($payment) {
                $payment = $this->membershipPaymentService->completeOnlinePayment($payment, $txData);

                return response()->json([
                    'success' => true,
                    'message' => 'Payment verified successfully. Membership is now active.',
                    'payment' => $payment->load('invoices'),
                ]);
            }

            return response()->json(['success' => true, 'message' => 'Payment verified.']);
        }

        return response()->json(['error' => 'Unsupported gateway'], 400);
    }

    /**
     * Webhook listener for Flutterwave.
     */
    public function webhookFlutterwave(Request $request): JsonResponse
    {
        if (! $this->flutterwaveService->verifyWebhook($request)) {
            return response()->json(['error' => 'Invalid webhook signature'], 401);
        }

        $payload = $request->all();
        $event = $payload['event'] ?? '';

        if ($event === 'charge.completed' || ($payload['status'] ?? '') === 'successful') {
            $txData = $payload['data'] ?? $payload;
            $txRef = $txData['tx_ref'] ?? null;

            if ($txRef) {
                $payment = Payment::where('transaction_id', $txRef)->first();
                if ($payment && $payment->status !== 'paid') {
                    $this->membershipPaymentService->completeOnlinePayment($payment, $txData);
                }
            }
        }

        return response()->json(['status' => 'acknowledged']);
    }

    /**
     * Webhook listener for Paystack.
     */
    public function webhookPaystack(Request $request): JsonResponse
    {
        if (! $this->paystackService->verifyWebhook($request)) {
            return response()->json(['error' => 'Invalid webhook signature'], 401);
        }

        $payload = $request->all();
        $event = $payload['event'] ?? '';

        if ($event === 'charge.success') {
            $txData = $payload['data'] ?? [];
            $reference = $txData['reference'] ?? null;

            if ($reference) {
                $payment = Payment::where('transaction_id', $reference)->first();
                if ($payment && $payment->status !== 'paid') {
                    $this->membershipPaymentService->completeOnlinePayment($payment, $txData);
                }
            }
        }

        return response()->json(['status' => 'acknowledged']);
    }
}

