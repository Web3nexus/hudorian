<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookLoan;
use App\Models\Payment;
use App\Models\User;
use App\Services\Currency\CurrencyRateService;
use App\Services\Library\BookCheckoutService;
use App\Services\Library\LibrarySettingsService;
use App\Services\Payments\FlutterwaveService;
use App\Services\Payments\PaystackService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class BookCheckoutController extends Controller
{
    public function __construct(
        protected BookCheckoutService $checkoutService,
        protected LibrarySettingsService $settingsService,
        protected FlutterwaveService $flutterwaveService,
        protected PaystackService $paystackService,
        protected CurrencyRateService $currencyRateService
    ) {}

    /**
     * Reject an impossible acquisition before any identity is touched.
     *
     * These checks are independent of who is asking, so running them ahead of
     * guest provisioning keeps a refused attempt from leaving behind a reader
     * account and a token for a purchase that never happened.
     */
    protected function assertAcquirable(Book $book, string $mode): void
    {
        $modes = $this->checkoutService->availableModes($book);

        if (! in_array($mode, $modes, true)) {
            abort(422, $mode === BookCheckoutService::MODE_RENTAL
                ? 'This title is not currently offered for rental.'
                : 'This title is not currently offered for purchase.');
        }

        $price = $mode === BookCheckoutService::MODE_RENTAL
            ? (float) $book->rental_price
            : (float) $book->purchase_price;

        abort_if($price <= 0, 422, 'This title has not been priced for that mode yet.');
    }

    /**
     * Resolve the reader behind the current request.
     *
     * Checkout and settlement are reachable without a session so a gateway can
     * hand a reader back, which means the default (session) guard is empty even
     * when a Sanctum token is present. The token guard has to be asked directly
     * or every bearer client would be mistaken for an anonymous guest.
     */
    protected function actingReader(Request $request): ?User
    {
        return $request->user() ?? $request->user('sanctum');
    }

    /**
     * Initialize a purchase or rental via the shared gateway set.
     */
    public function initialize(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'book_id' => 'required|integer|exists:books,id',
            'mode' => 'required|in:purchase,rental',
            'gateway' => 'required|in:flutterwave,paystack,manual',
            'currency' => 'nullable|string|in:EUR,NGN,USD,GBP',
            'redirect_url' => 'nullable|url',
            // Guest details, mirroring the membership checkout. Without a
            // session an address is mandatory: it is the only identity the
            // reader will have, and the only way back into the archive.
            'email' => [
                Rule::requiredIf(fn () => ! $this->actingReader($request)),
                'nullable',
                'email',
                'max:255',
            ],
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:30',
            'transfer_reference' => 'nullable|string|max:100',
            'sender_bank' => 'nullable|string|max:100',
            'sender_account_name' => 'nullable|string|max:150',
            'transfer_date' => 'nullable|date',
            'proof_notes' => 'nullable|string|max:1000',
        ]);

        $book = Book::published()->findOrFail($validated['book_id']);

        // Everything that can be judged without an identity is judged first, so
        // a doomed attempt never provisions a guest account on the way out.
        $this->assertAcquirable($book, $validated['mode']);

        $basePrice = $validated['mode'] === BookCheckoutService::MODE_RENTAL
            ? (float) $book->rental_price
            : (float) $book->purchase_price;

        [$user, $issuedToken] = $this->resolveUser($request, $validated);

        // A perpetual holder never needs to pay again.
        $existing = $this->checkoutService->activeLoan($user, $book);
        if ($existing && $existing->loan_type === BookCheckoutService::MODE_PURCHASE) {
            return response()->json([
                'error' => 'Already in Your Archive',
                'message' => 'This title is already in your archive under perpetual licence.',
            ], 409);
        }

        $modes = $this->checkoutService->availableModes($book, $user);
        if (! in_array($validated['mode'], $modes, true)) {
            return response()->json([
                'error' => 'Mode Unavailable',
                'message' => $validated['mode'] === 'rental'
                    ? 'This title is not currently offered for rental.'
                    : 'This title is not currently offered for purchase.',
            ], 422);
        }

        $baseCurrency = strtoupper($book->currency ?: 'EUR');
        $targetCurrency = strtoupper($validated['currency'] ?? $baseCurrency);

        $conversion = $this->currencyRateService->convert(
            $basePrice,
            $baseCurrency,
            $targetCurrency,
            $validated['gateway']
        );

        $finalAmount = (float) $conversion['target_amount'];
        $finalCurrency = (string) $conversion['target_currency'];
        $exchangeRate = (float) $conversion['rate'];
        $rateProvider = (string) $conversion['provider'];

        $redirectUrl = $validated['redirect_url'] ?? url('/royal-archive/my-archive');
        $rateMeta = ['exchange_rate' => $exchangeRate, 'rate_provider' => $rateProvider];

        if ($validated['gateway'] === 'manual') {
            $payment = $this->checkoutService->recordPayment(
                $user,
                $book,
                $validated['mode'],
                'manual',
                'pending',
                $this->checkoutService->generateTransactionId('manual', $user->id),
                $finalAmount,
                $finalCurrency,
                array_merge($rateMeta, [
                    'transfer_reference' => $validated['transfer_reference'] ?? ('WIRE-'.strtoupper(Str::random(8))),
                    'sender_bank' => $validated['sender_bank'] ?? null,
                    'sender_account_name' => $validated['sender_account_name'] ?? $user->name,
                    'transfer_date' => $validated['transfer_date'] ?? now()->toDateString(),
                    'proof_notes' => $validated['proof_notes'] ?? null,
                ])
            );

            return response()->json([
                'success' => true,
                'gateway' => 'manual',
                'status' => 'pending',
                'message' => 'Your transfer has been submitted for Treasury clearance. Access is granted once the payment is confirmed.',
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
                // Persist this client-side so a guest can open their archive.
                'token' => $issuedToken,
            ], 201);
        }

        if ($validated['gateway'] === 'flutterwave') {
            $txRef = $this->checkoutService->generateTransactionId('flutterwave', $user->id);

            $init = $this->flutterwaveService->initializePayment(
                $user,
                $finalAmount,
                $finalCurrency,
                $txRef,
                [
                    'book_id' => $book->id,
                    'book_title' => $book->title,
                    'acquisition_mode' => $validated['mode'],
                ],
                $redirectUrl
            );

            if (! $init['success']) {
                $this->discardProvisionedGuest($user, $issuedToken);

                return response()->json([
                    'error' => 'Payment Initialization Failed',
                    'message' => $init['error'] ?? 'Could not initialize Flutterwave payment.',
                ], 422);
            }

            $payment = $this->checkoutService->recordPayment(
                $user,
                $book,
                $validated['mode'],
                'flutterwave',
                'pending',
                $txRef,
                $finalAmount,
                $finalCurrency,
                array_merge($rateMeta, ['checkout_url' => $init['checkout_url'] ?? null])
            );

            return response()->json([
                'success' => true,
                'gateway' => 'flutterwave',
                'checkout_url' => $init['checkout_url'] ?? null,
                'tx_ref' => $txRef,
                'payment_id' => $payment->id,
                'amount' => $finalAmount,
                'currency' => $finalCurrency,
                'exchange_rate' => $exchangeRate,
                'rate_provider' => $rateProvider,
                'token' => $issuedToken,
            ]);
        }

        $reference = $this->checkoutService->generateTransactionId('paystack', $user->id);

        $init = $this->paystackService->initializePayment(
            $user,
            $finalAmount,
            $finalCurrency,
            $reference,
            [
                'book_id' => $book->id,
                'book_title' => $book->title,
                'acquisition_mode' => $validated['mode'],
            ],
            $redirectUrl
        );

        if (! $init['success']) {
            $this->discardProvisionedGuest($user, $issuedToken);

            return response()->json([
                'error' => 'Payment Initialization Failed',
                'message' => $init['error'] ?? 'Could not initialize Paystack payment.',
            ], 422);
        }

        $payment = $this->checkoutService->recordPayment(
            $user,
            $book,
            $validated['mode'],
            'paystack',
            'pending',
            $reference,
            $finalAmount,
            $finalCurrency,
            array_merge($rateMeta, [
                'authorization_url' => $init['authorization_url'] ?? null,
                'access_code' => $init['access_code'] ?? null,
            ])
        );

        return response()->json([
            'success' => true,
            'gateway' => 'paystack',
            'authorization_url' => $init['authorization_url'] ?? null,
            'access_code' => $init['access_code'] ?? null,
            'reference' => $reference,
            'payment_id' => $payment->id,
            'amount' => $finalAmount,
            'currency' => $finalCurrency,
            'exchange_rate' => $exchangeRate,
            'rate_provider' => $rateProvider,
            'token' => $issuedToken,
        ]);
    }

    /**
     * Verify a settled card payment and issue the archive loan.
     *
     * Only the reader who initiated the payment may trigger fulfilment, and the
     * gateway must confirm the same amount, currency and reference we recorded.
     */
    public function verify(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'gateway' => 'required|in:flutterwave,paystack',
            'reference' => 'nullable|string',
            'transaction_id' => 'nullable|string',
        ]);

        $gateway = $validated['gateway'];
        $reference = $validated['reference'] ?? $validated['transaction_id'] ?? null;

        if (empty($reference)) {
            return response()->json(['error' => 'A transaction reference is required.'], 422);
        }

        $payment = Payment::where('transaction_id', $reference)
            ->where('payable_type', Book::class)
            ->first();

        if (! $payment) {
            return response()->json([
                'error' => 'Payment Not Found',
                'message' => 'No archive payment matches this reference.',
            ], 404);
        }

        // Ownership is settled before anything else: a reference is a bearer
        // detail, so a stranger must never learn that a payment exists at all.
        if (! $this->belongsToRequestingReader($request, $payment)) {
            return response()->json([
                'error' => 'Forbidden',
                'message' => 'This payment belongs to another reader.',
            ], 403);
        }

        // A settled payment is already fulfilled; answering does not require the
        // gateway round trip and never grants anything further.
        if ($payment->status === 'paid') {
            return response()->json([
                'success' => true,
                'message' => 'This payment has already been settled.',
                'payment' => $payment,
                'access' => $this->accessFor($payment),
            ]);
        }

        $result = $gateway === 'flutterwave'
            ? $this->flutterwaveService->verifyTransaction($reference)
            : $this->paystackService->verifyTransaction($reference);

        if (! $result['success']) {
            return response()->json([
                'error' => 'Verification Failed',
                'message' => $result['error'] ?? 'The gateway could not verify this transaction.',
            ], 422);
        }

        if (! $this->matchesRecordedPayment($payment, $result['data'] ?? [])) {
            return response()->json([
                'error' => 'Verification Mismatch',
                'message' => 'The gateway result does not match the amount recorded for this payment.',
            ], 422);
        }

        // The gateway round trip above is slow, so a webhook (or a second tab
        // returning from the gateway) can settle the same payment meanwhile. The
        // row is locked and re-read so fulfilment only ever runs once.
        $settled = DB::transaction(function () use ($payment, $result) {
            $locked = Payment::where('id', $payment->id)->lockForUpdate()->first();

            if (! $locked || $locked->status !== 'pending') {
                return null;
            }

            $locked->update([
                'status' => 'paid',
                'metadata' => array_merge($locked->metadata ?? [], [
                    'gateway_verification' => $result['data'] ?? [],
                    'verified_at' => now()->toIso8601String(),
                ]),
            ]);

            return $this->checkoutService->fulfilFromPayment($locked->fresh());
        });

        if ($settled === null) {
            $fresh = $payment->fresh();

            return response()->json([
                'success' => true,
                'message' => 'This payment has already been settled.',
                'payment' => $fresh,
                'access' => $this->accessFor($fresh),
            ]);
        }

        $loan = $settled;

        return response()->json([
            'success' => true,
            'message' => 'Payment verified. The title has been added to your archive.',
            'payment' => $payment->fresh(),
            'access' => $this->accessFor($payment->fresh(), $loan),
        ]);
    }

    /**
     * The reader must be the one who opened the checkout, whether they are
     * signed in or using the guest token issued at that moment.
     */
    protected function belongsToRequestingReader(Request $request, Payment $payment): bool
    {
        $user = $this->actingReader($request);

        if (! $user) {
            return false;
        }

        return (int) $payment->user_id === (int) $user->id;
    }

    /**
     * Guard against a gateway confirming a different amount or a reference that
     * does not match the payment we are about to settle.
     */
    protected function matchesRecordedPayment(Payment $payment, array $gatewayData): bool
    {
        $reference = $gatewayData['reference']
            ?? $gatewayData['tx_ref']
            ?? $gatewayData['id']
            ?? null;

        if (filled($reference) && (string) $reference !== (string) $payment->transaction_id) {
            return false;
        }

        $amount = $gatewayData['amount'] ?? $gatewayData['amount_paid'] ?? null;
        if (filled($amount) && abs((float) $amount - (float) $payment->amount) > 0.01) {
            return false;
        }

        $currency = $gatewayData['currency'] ?? null;
        if (filled($currency) && strtoupper((string) $currency) !== strtoupper((string) $payment->currency)) {
            return false;
        }

        return true;
    }

    /**
     * Undo a guest account created for an attempt that never became a payment.
     *
     * Provisioning happens before the gateway is called so the payer identity is
     * available, but a failed initialization must not leave a reader and a token
     * behind for a purchase that does not exist. Only a token this request issued
     * marks the account as ours to remove.
     */
    protected function discardProvisionedGuest(User $user, ?string $issuedToken): void
    {
        if ($issuedToken === null) {
            return;
        }

        DB::transaction(function () use ($user) {
            $user->tokens()->delete();
            $user->delete();
        });
    }

    /**
     * Resolve the acting user, provisioning one for guests exactly as the
     * membership checkout does so a guest purchase still lands in an archive.
     *
     * A guest is issued a Sanctum token which the frontend must persist; it is
     * the only way back into the archive they just paid for. Because that token
     * is a credential, it is only ever minted for an account this very request
     * created: an address that already has a reader must sign in first, or the
     * checkout would hand out an access token for someone else's account.
     *
     * @return array{0: User, 1: string|null}
     */
    protected function resolveUser(Request $request, array $validated): array
    {
        $user = $this->actingReader($request);
        if ($user) {
            return [$user, null];
        }

        abort_if(blank($validated['email'] ?? null), 422, 'An email address is required to open an archive.');

        $attributes = ['email' => $validated['email']];

        $user = User::where($attributes)->first();

        if ($user) {
            abort(401, 'An account already exists for this address. Sign in to complete your acquisition.');
        }

        $user = User::create($attributes + [
            'name' => $validated['name'] ?? explode('@', $validated['email'])[0],
            'password' => Hash::make(Str::random(16)),
            'phone' => $validated['phone'] ?? null,
            'role' => 'member',
        ]);

        return [$user, $user->createToken('archive-guest')->plainTextToken];
    }

    protected function accessFor(Payment $payment, ?BookLoan $loan = null): ?array
    {
        $loan = $loan ?: BookLoan::where('payment_id', $payment->id)->first();

        if (! $loan) {
            return null;
        }

        return [
            'loan_id' => $loan->id,
            'loan_type' => $loan->loan_type,
            'status' => $loan->status,
            'expires_at' => $loan->expires_at?->toIso8601String(),
        ];
    }
}
