<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\Currency\CurrencyRateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CurrencyController extends Controller
{
    protected CurrencyRateService $currencyRateService;

    public function __construct(CurrencyRateService $currencyRateService)
    {
        $this->currencyRateService = $currencyRateService;
    }

    /**
     * Get live currency exchange rates.
     */
    public function rates(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'gateway' => 'nullable|string|in:manual,flutterwave,paystack',
            'base' => 'nullable|string|in:EUR,NGN,USD,GBP,eur,ngn,usd,gbp',
        ]);

        $gateway = $validated['gateway'] ?? 'manual';
        $base = strtoupper($validated['base'] ?? 'EUR');

        $ratesData = $this->currencyRateService->getRates($gateway, $base);

        return response()->json([
            'status' => 'success',
            'data' => $ratesData,
        ]);
    }

    /**
     * Convert an amount between currencies.
     */
    public function convert(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'from' => 'required|string|in:EUR,NGN,USD,GBP,eur,ngn,usd,gbp',
            'to' => 'required|string|in:EUR,NGN,USD,GBP,eur,ngn,usd,gbp',
            'gateway' => 'nullable|string|in:manual,flutterwave,paystack',
        ]);

        $amount = (float) $validated['amount'];
        $from = strtoupper($validated['from']);
        $to = strtoupper($validated['to']);
        $gateway = $validated['gateway'] ?? 'manual';

        $conversion = $this->currencyRateService->convert($amount, $from, $to, $gateway);

        return response()->json([
            'status' => 'success',
            'data' => $conversion,
        ]);
    }
}
