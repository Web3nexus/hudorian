<?php

namespace App\Services\Currency;

use App\Services\Payments\PaymentSettingsService;
use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CurrencyRateService
{
    /**
     * Fallback benchmark rates relative to EUR (used if offline or third-party API is temporarily unreachable).
     */
    protected const DEFAULT_EUR_RATES = [
        'EUR' => 1.0,
        'NGN' => 1540.0,
        'USD' => 1.08,
        'GBP' => 0.85,
    ];

    protected PaymentSettingsService $settingsService;

    public function __construct(PaymentSettingsService $settingsService)
    {
        $this->settingsService = $settingsService;
    }

    /**
     * Get currency exchange rates for a given provider and base currency.
     *
     * @param string $provider 'manual' (ExchangeRate-API), 'flutterwave', or 'paystack'
     * @param string $base Base currency code (default: 'EUR')
     * @return array{base: string, provider: string, rates: array<string, float>, updated_at: string, is_live: bool}
     */
    public function getRates(string $provider = 'manual', string $base = 'EUR'): array
    {
        $base = strtoupper($base);
        $provider = strtolower($provider);
        $cacheKey = "currency_rates:{$provider}:{$base}";

        return Cache::remember($cacheKey, now()->addHours(2), function () use ($provider, $base) {
            if ($provider === 'flutterwave') {
                return $this->fetchFlutterwaveRates($base);
            }

            if ($provider === 'paystack') {
                return $this->fetchPaystackRates($base);
            }

            // Default for manual transfer and general UI: ExchangeRate-API
            return $this->fetchExchangeRateApiRates($base);
        });
    }

    /**
     * Convert an amount between currencies using the selected provider's rate.
     *
     * @param float $amount Amount to convert
     * @param string $from Source currency
     * @param string $to Target currency
     * @param string $provider 'manual', 'flutterwave', or 'paystack'
     * @return array{original_amount: float, original_currency: string, target_amount: float, target_currency: string, rate: float, provider: string, is_live: bool}
     */
    public function convert(float $amount, string $from, string $to, string $provider = 'manual'): array
    {
        $from = strtoupper($from);
        $to = strtoupper($to);

        if ($from === $to) {
            return [
                'original_amount' => $amount,
                'original_currency' => $from,
                'target_amount' => $amount,
                'target_currency' => $to,
                'rate' => 1.0,
                'provider' => $provider,
                'is_live' => true,
            ];
        }

        // Fetch rates based on the source currency
        $rateData = $this->getRates($provider, $from);
        $rate = $rateData['rates'][$to] ?? null;

        if ($rate === null) {
            // Fallback: derive cross-rate via EUR base
            $eurRates = $this->getRates('manual', 'EUR');
            $rateFromEUR = $eurRates['rates'][$from] ?? 1.0;
            $rateToEUR = $eurRates['rates'][$to] ?? 1.0;
            $rate = $rateFromEUR > 0 ? ($rateToEUR / $rateFromEUR) : 1.0;
        }

        $targetAmount = round($amount * $rate, 2);

        return [
            'original_amount' => $amount,
            'original_currency' => $from,
            'target_amount' => $targetAmount,
            'target_currency' => $to,
            'rate' => round($rate, 4),
            'provider' => $rateData['provider'],
            'is_live' => $rateData['is_live'],
        ];
    }

    /**
     * Fetch rates from ExchangeRate-API (recommended for manual wire & standard benchmark).
     */
    protected function fetchExchangeRateApiRates(string $base): array
    {
        $apiKey = env('EXCHANGERATE_API_KEY');
        $endpoint = ! empty($apiKey)
            ? "https://v6.exchangerate-api.com/v6/{$apiKey}/latest/{$base}"
            : "https://open.er-api.com/v6/latest/{$base}";

        try {
            $response = Http::timeout(8)->get($endpoint);

            if ($response->successful()) {
                $data = $response->json();
                if (! empty($data['rates']) && is_array($data['rates'])) {
                    $supported = ['EUR', 'NGN', 'USD', 'GBP'];
                    $filteredRates = [];
                    foreach ($supported as $curr) {
                        if (isset($data['rates'][$curr])) {
                            $filteredRates[$curr] = (float) $data['rates'][$curr];
                        }
                    }

                    return [
                        'base' => $base,
                        'provider' => 'ExchangeRate-API',
                        'rates' => $filteredRates,
                        'updated_at' => now()->toIso8601String(),
                        'is_live' => true,
                    ];
                }
            }
        } catch (Exception $e) {
            Log::warning('ExchangeRate-API request failed, utilizing fallback rates: ' . $e->getMessage());
        }

        return $this->getFallbackRates($base, 'ExchangeRate-API (Cached Fallback)');
    }

    /**
     * Fetch rates from Flutterwave Transfers Rate API.
     */
    protected function fetchFlutterwaveRates(string $base): array
    {
        $settings = $this->settingsService->getSettings();
        $secretKey = $settings['flutterwave_secret_key'] ?? env('FLW_SECRET_KEY');

        if (! empty($secretKey)) {
            try {
                $targetCurrencies = array_diff(['EUR', 'NGN', 'USD', 'GBP'], [$base]);
                $rates = [$base => 1.0];

                foreach ($targetCurrencies as $target) {
                    $response = Http::withToken($secretKey)
                        ->timeout(6)
                        ->get('https://api.flutterwave.com/v3/transfers/rates', [
                            'amount' => 100,
                            'source_currency' => $base,
                            'destination_currency' => $target,
                        ]);

                    if ($response->successful()) {
                        $body = $response->json();
                        if (! empty($body['data']['rate'])) {
                            $rates[$target] = (float) $body['data']['rate'];
                        }
                    }
                }

                if (count($rates) > 1) {
                    return [
                        'base' => $base,
                        'provider' => 'Flutterwave FX Gateway',
                        'rates' => $rates,
                        'updated_at' => now()->toIso8601String(),
                        'is_live' => true,
                    ];
                }
            } catch (Exception $e) {
                Log::warning('Flutterwave rate query failed: ' . $e->getMessage());
            }
        }

        // If keys are not configured or request fails, fetch via ExchangeRate-API with provider attribution
        $rates = $this->fetchExchangeRateApiRates($base);
        $rates['provider'] = 'Flutterwave (Synced Market Rate)';
        return $rates;
    }

    /**
     * Fetch rates for Paystack gateway transactions.
     */
    protected function fetchPaystackRates(string $base): array
    {
        // Paystack handles multi-currency transactions via standard settlement exchange rates.
        // We sync with ExchangeRate-API for the live spot rates, tagged with Paystack provider attribution.
        $rates = $this->fetchExchangeRateApiRates($base);
        $rates['provider'] = 'Paystack Gateway Rates';
        return $rates;
    }

    /**
     * Generate relative fallback rates from standard defaults.
     */
    protected function getFallbackRates(string $base, string $providerName): array
    {
        $eurRates = self::DEFAULT_EUR_RATES;
        $baseRateFromEur = $eurRates[$base] ?? 1.0;

        $relativeRates = [];
        foreach ($eurRates as $curr => $rateFromEur) {
            $relativeRates[$curr] = round($rateFromEur / $baseRateFromEur, 4);
        }

        return [
            'base' => $base,
            'provider' => $providerName,
            'rates' => $relativeRates,
            'updated_at' => now()->toIso8601String(),
            'is_live' => false,
        ];
    }
}

