<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\Payments\MembershipPaymentService;
use App\Services\Payments\PaymentGatewayInterface;
use App\Services\Payments\PaymentSettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPaymentController extends Controller
{
    protected PaymentGatewayInterface $paymentGateway;
    protected PaymentSettingsService $settingsService;
    protected MembershipPaymentService $membershipPaymentService;

    public function __construct(
        PaymentGatewayInterface $paymentGateway,
        PaymentSettingsService $settingsService,
        MembershipPaymentService $membershipPaymentService
    ) {
        $this->paymentGateway = $paymentGateway;
        $this->settingsService = $settingsService;
        $this->membershipPaymentService = $membershipPaymentService;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Payment::with(['user', 'invoices', 'refunds', 'payable']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('provider')) {
            $query->where('provider', $request->provider);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('transaction_id', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        $payments = $query->orderByDesc('created_at')->paginate(25);

        return response()->json($payments);
    }

    public function export(Request $request)
    {
        $query = Payment::with(['user', 'payable']);

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('provider') && $request->provider !== 'all') {
            $query->where('provider', $request->provider);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('transaction_id', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        $payments = $query->orderByDesc('created_at')->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="hudorian-transactions-' . date('Y-m-d') . '.csv"',
        ];

        $callback = function () use ($payments) {
            $file = fopen('php://output', 'w');
            fputcsv($file, [
                'ID',
                'Transaction Ref',
                'Patron Name',
                'Patron Email',
                'Amount',
                'Currency',
                'Provider',
                'Status',
                'Payable Type',
                'Payment Method',
                'Date',
            ]);

            foreach ($payments as $payment) {
                fputcsv($file, [
                    $payment->id,
                    $payment->transaction_id ?? $payment->reference ?? '—',
                    $payment->user->name ?? 'Guest / Candidate',
                    $payment->user->email ?? '—',
                    $payment->amount,
                    $payment->currency ?? 'EUR',
                    $payment->provider ?? 'manual',
                    $payment->status,
                    class_basename($payment->payable_type ?? 'Membership'),
                    $payment->payment_method ?? 'Bank Wire / Card',
                    $payment->created_at ? $payment->created_at->format('Y-m-d H:i:s') : '—',
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function show(int $id): JsonResponse
    {
        $payment = Payment::with(['user', 'invoices', 'refunds', 'payable'])->findOrFail($id);

        return response()->json([
            'data' => $payment,
        ]);
    }

    public function refund(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'amount' => 'nullable|numeric|min:0.01',
            'reason' => 'nullable|string|max:500',
        ]);

        $payment = Payment::findOrFail($id);

        $success = $this->paymentGateway->refund($payment, $request->amount, $request->reason);

        return response()->json([
            'message' => 'Refund processed successfully.',
            'data' => $payment->fresh(['refunds']),
        ]);
    }

    /**
     * Get payment gateway settings for admin configuration.
     */
    public function getSettings(): JsonResponse
    {
        return response()->json([
            'settings' => $this->settingsService->getSettings(),
        ]);
    }

    /**
     * Update payment gateway settings from admin panel.
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'flutterwave_enabled' => 'nullable|boolean',
            'flutterwave_public_key' => 'nullable|string|max:255',
            'flutterwave_secret_key' => 'nullable|string|max:255',
            'flutterwave_encryption_key' => 'nullable|string|max:255',
            'flutterwave_webhook_secret' => 'nullable|string|max:255',

            'paystack_enabled' => 'nullable|boolean',
            'paystack_public_key' => 'nullable|string|max:255',
            'paystack_secret_key' => 'nullable|string|max:255',
            'paystack_webhook_secret' => 'nullable|string|max:255',

            'manual_enabled' => 'nullable|boolean',
            'manual_bank_name' => 'nullable|string|max:255',
            'manual_account_name' => 'nullable|string|max:255',
            'manual_account_number' => 'nullable|string|max:255',
            'manual_iban' => 'nullable|string|max:255',
            'manual_swift_bic' => 'nullable|string|max:255',
            'manual_sort_code' => 'nullable|string|max:255',
            'manual_instructions' => 'nullable|string|max:2000',

            'default_currency' => 'nullable|string|max:5',
        ]);

        $updated = $this->settingsService->updateSettings($validated);

        return response()->json([
            'message' => 'Payment gateway settings updated successfully.',
            'settings' => $updated,
        ]);
    }

    /**
     * Approve a pending manual payment, issue invoice, and activate/renew membership.
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        $payment = Payment::with('user')->findOrFail($id);

        if ($payment->status === 'paid') {
            return response()->json(['message' => 'Payment is already marked as paid.', 'data' => $payment], 200);
        }

        $approved = $this->membershipPaymentService->approveManualPayment(
            $payment,
            $request->user(),
            $request->notes
        );

        return response()->json([
            'message' => 'Manual wire transfer approved. Member privileges and invoice issued.',
            'data' => $approved->load(['invoices', 'user.member']),
        ]);
    }

    /**
     * Reject a pending manual payment.
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $payment = Payment::with('user')->findOrFail($id);

        $rejected = $this->membershipPaymentService->rejectManualPayment(
            $payment,
            $request->user(),
            $request->reason
        );

        return response()->json([
            'message' => 'Manual payment rejected.',
            'data' => $rejected,
        ]);
    }
}
