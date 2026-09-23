<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\Payments\PaymentGatewayInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPaymentController extends Controller
{
    protected PaymentGatewayInterface $paymentGateway;

    public function __construct(PaymentGatewayInterface $paymentGateway)
    {
        $this->paymentGateway = $paymentGateway;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Payment::with(['user', 'invoices', 'refunds']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
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

        $payments = $query->orderByDesc('created_at')->paginate(20);

        return response()->json($payments);
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
}

