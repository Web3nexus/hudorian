<?php

namespace App\Services\Security;

use App\Models\CmsBlock;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CaptchaVerificationService
{
    /**
     * Verify CAPTCHA token according to configured provider.
     *
     * @return array{success: bool, error?: string}
     */
    public function verify(?string $token, ?string $clientIp = null): array
    {
        $settings = $this->getSecuritySettings();
        $provider = $settings['captcha_provider'] ?? 'none';

        if ($provider === 'none' || empty($provider)) {
            return ['success' => true];
        }

        if (empty($token)) {
            return [
                'success' => false,
                'error' => 'Security challenge response is required.',
            ];
        }

        if ($provider === 'cloudflare_turnstile') {
            return $this->verifyCloudflareTurnstile($token, $settings, $clientIp);
        }

        if ($provider === 'google_recaptcha') {
            return $this->verifyGoogleRecaptcha($token, $settings, $clientIp);
        }

        return ['success' => true];
    }

    /**
     * Get active security settings payload from database.
     */
    public function getSecuritySettings(): array
    {
        $block = CmsBlock::where('key', 'security_settings')->first();
        if (! $block || ! is_array($block->payload)) {
            return [
                'captcha_provider' => 'none',
                'cloudflare_site_key' => null,
                'cloudflare_secret_key' => null,
                'google_recaptcha_site_key' => null,
                'google_recaptcha_secret_key' => null,
            ];
        }

        return $block->payload;
    }

    /**
     * Verify Cloudflare Turnstile token.
     */
    protected function verifyCloudflareTurnstile(string $token, array $settings, ?string $clientIp): array
    {
        $secretKey = $settings['cloudflare_secret_key'] ?? env('CLOUDFLARE_TURNSTILE_SECRET_KEY');
        if (empty($secretKey)) {
            // Secret not configured yet, do not block admin
            return ['success' => true];
        }

        try {
            $response = Http::asForm()->timeout(5)->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
                'secret' => $secretKey,
                'response' => $token,
                'remoteip' => $clientIp,
            ]);

            $data = $response->json();
            if ($response->successful() && ! empty($data['success'])) {
                return ['success' => true];
            }

            Log::warning('Cloudflare Turnstile verification failed', ['data' => $data]);
            return [
                'success' => false,
                'error' => 'Cloudflare Turnstile verification failed. Please try again.',
            ];
        } catch (\Throwable $e) {
            Log::error('Cloudflare Turnstile network error', ['error' => $e->getMessage()]);
            // On upstream timeout, permit or gracefully report
            return [
                'success' => false,
                'error' => 'Unable to verify security challenge with Cloudflare. Please try again.',
            ];
        }
    }

    /**
     * Verify Google reCAPTCHA token.
     */
    protected function verifyGoogleRecaptcha(string $token, array $settings, ?string $clientIp): array
    {
        $secretKey = $settings['google_recaptcha_secret_key'] ?? env('RECAPTCHA_SECRET_KEY');
        if (empty($secretKey)) {
            return ['success' => true];
        }

        try {
            $response = Http::asForm()->timeout(5)->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => $secretKey,
                'response' => $token,
                'remoteip' => $clientIp,
            ]);

            $data = $response->json();
            if ($response->successful() && ! empty($data['success'])) {
                return ['success' => true];
            }

            Log::warning('Google reCAPTCHA verification failed', ['data' => $data]);
            return [
                'success' => false,
                'error' => 'reCAPTCHA verification failed. Please try again.',
            ];
        } catch (\Throwable $e) {
            Log::error('Google reCAPTCHA network error', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'error' => 'Unable to verify reCAPTCHA challenge. Please try again.',
            ];
        }
    }
}
