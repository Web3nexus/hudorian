<?php

namespace App\Services\Payments;

use App\Models\CmsBlock;

class PaymentSettingsService
{
    public const CMS_KEY = 'payment_settings';

    /**
     * Default payment gateway configuration.
     */
    public static function defaults(): array
    {
        return [
            // Flutterwave
            'flutterwave_enabled' => false,
            'flutterwave_public_key' => env('FLW_PUBLIC_KEY', ''),
            'flutterwave_secret_key' => env('FLW_SECRET_KEY', ''),
            'flutterwave_encryption_key' => env('FLW_ENCRYPTION_KEY', ''),
            'flutterwave_webhook_secret' => env('FLW_WEBHOOK_SECRET', ''),

            // Paystack
            'paystack_enabled' => false,
            'paystack_public_key' => env('PAYSTACK_PUBLIC_KEY', ''),
            'paystack_secret_key' => env('PAYSTACK_SECRET_KEY', ''),
            'paystack_webhook_secret' => env('PAYSTACK_WEBHOOK_SECRET', ''),

            // Manual Bank Transfer / Wire
            'manual_enabled' => true,
            'manual_bank_name' => 'Coutts & Co / Barclays Private Bank',
            'manual_account_name' => 'HUDORIAN SANCTUARY LIMITED',
            'manual_account_number' => '88291048',
            'manual_iban' => 'GB29BARC20000088291048',
            'manual_swift_bic' => 'BARCGB22',
            'manual_sort_code' => '20-00-00',
            'manual_instructions' => 'Please quote your Full Name or Membership Dossier Reference as the wire transfer reference. Dues are verified and cleared by Treasury within 24 hours of receipt.',

            // General
            'default_currency' => 'EUR',
        ];
    }

    /**
     * Get all payment gateway settings (including secret keys for admin).
     */
    public function getSettings(): array
    {
        $block = CmsBlock::where('key', self::CMS_KEY)->first();
        if (! $block || ! is_array($block->payload)) {
            return self::defaults();
        }

        return array_merge(self::defaults(), $block->payload);
    }

    /**
     * Get public-facing payment gateway configuration (safe for frontend).
     */
    public function getPublicConfig(): array
    {
        $settings = $this->getSettings();

        return [
            'flutterwave' => [
                'enabled' => (bool) ($settings['flutterwave_enabled'] ?? false),
                'public_key' => ! empty($settings['flutterwave_public_key']) ? $settings['flutterwave_public_key'] : null,
            ],
            'paystack' => [
                'enabled' => (bool) ($settings['paystack_enabled'] ?? false),
                'public_key' => ! empty($settings['paystack_public_key']) ? $settings['paystack_public_key'] : null,
            ],
            'manual' => [
                'enabled' => (bool) ($settings['manual_enabled'] ?? true),
                'bank_name' => $settings['manual_bank_name'] ?? 'Coutts & Co / Barclays Private Bank',
                'account_name' => $settings['manual_account_name'] ?? 'HUDORIAN SANCTUARY LIMITED',
                'account_number' => $settings['manual_account_number'] ?? '88291048',
                'iban' => $settings['manual_iban'] ?? 'GB29BARC20000088291048',
                'swift_bic' => $settings['manual_swift_bic'] ?? 'BARCGB22',
                'sort_code' => $settings['manual_sort_code'] ?? '20-00-00',
                'instructions' => $settings['manual_instructions'] ?? 'Please quote your Full Name or Membership Dossier Reference as the wire transfer reference.',
            ],
            'default_currency' => $settings['default_currency'] ?? 'EUR',
        ];
    }

    /**
     * Update payment gateway settings.
     */
    public function updateSettings(array $data): array
    {
        $current = $this->getSettings();
        $updated = array_merge($current, $data);

        // Normalize booleans
        $updated['flutterwave_enabled'] = filter_var($updated['flutterwave_enabled'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $updated['paystack_enabled'] = filter_var($updated['paystack_enabled'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $updated['manual_enabled'] = filter_var($updated['manual_enabled'] ?? true, FILTER_VALIDATE_BOOLEAN);

        CmsBlock::updateOrCreate(
            ['key' => self::CMS_KEY],
            [
                'title' => 'Payment Gateway Settings',
                'subtitle' => 'Flutterwave, Paystack, and Manual Bank Wire Configuration',
                'payload' => $updated,
            ]
        );

        return $updated;
    }
}

