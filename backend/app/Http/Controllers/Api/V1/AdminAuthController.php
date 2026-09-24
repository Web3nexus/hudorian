<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CmsBlock;
use App\Services\SecureGate\SecureGateServiceInterface;
use App\Services\Security\CaptchaVerificationService;
use App\Services\Security\TotpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;

class AdminAuthController extends Controller
{
    protected SecureGateServiceInterface $secureGate;
    protected CaptchaVerificationService $captchaService;
    protected TotpService $totpService;

    public function __construct(
        SecureGateServiceInterface $secureGate,
        CaptchaVerificationService $captchaService,
        TotpService $totpService
    ) {
        $this->secureGate = $secureGate;
        $this->captchaService = $captchaService;
        $this->totpService = $totpService;
    }

    /**
     * Get public security configuration (for login captcha widget).
     */
    public function getPublicConfig(): JsonResponse
    {
        $settings = $this->captchaService->getSecuritySettings();

        return response()->json([
            'captcha_provider' => $settings['captcha_provider'] ?? 'none',
            'cloudflare_site_key' => $settings['cloudflare_site_key'] ?? null,
            'google_recaptcha_site_key' => $settings['google_recaptcha_site_key'] ?? null,
        ]);
    }

    /**
     * Initiate SecureGate Administrative Login.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'captcha_token' => 'nullable|string',
        ]);

        // 1. Verify CAPTCHA challenge if enabled in panel
        $captchaResult = $this->captchaService->verify($request->captcha_token, $request->ip());
        if (! $captchaResult['success']) {
            return response()->json([
                'error' => 'Security Verification Failed',
                'message' => $captchaResult['error'] ?? 'Please complete the security challenge.',
            ], 422);
        }

        // 2. Authenticate admin credentials
        $deviceContext = [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ];

        $result = $this->secureGate->authenticateAdmin(
            $request->email,
            $request->password,
            null,
            $deviceContext
        );

        if (! $result['success']) {
            return response()->json([
                'error' => 'Authentication Failed',
                'message' => $result['error'],
            ], 401);
        }

        // 3. If 2FA is OFF (default), log in immediately
        if (! $result['requires_mfa']) {
            $user = $result['user'];
            return response()->json([
                'message' => 'SecureGate clearance granted.',
                'requires_mfa' => false,
                'admin' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'google2fa_enabled' => false,
                ],
                'token' => $result['token'],
            ]);
        }

        // 4. If 2FA is ON, challenge for real Google Authenticator code
        return response()->json([
            'status' => 'mfa_required',
            'requires_mfa' => true,
            'mfa_token' => $result['mfa_token'],
            'message' => 'Enter the 6-digit verification code from your Google Authenticator app.',
        ]);
    }

    /**
     * Verify SecureGate secondary Google Authenticator TOTP code.
     */
    public function verifyMfa(Request $request): JsonResponse
    {
        $request->validate([
            'mfa_token' => 'required|string',
            'code' => 'required|string',
        ]);

        $deviceContext = [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ];

        $result = $this->secureGate->verifyMfaChallenge(
            $request->mfa_token,
            $request->code,
            $deviceContext
        );

        if (! $result['success']) {
            return response()->json([
                'error' => 'MFA Verification Failed',
                'message' => $result['error'],
            ], 422);
        }

        $user = $result['user'];

        return response()->json([
            'message' => 'SecureGate clearance granted.',
            'requires_mfa' => false,
            'admin' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'google2fa_enabled' => (bool) $user->google2fa_enabled,
            ],
            'token' => $result['token'],
        ]);
    }

    /**
     * Generate Google Authenticator secret and QR code URI.
     */
    public function setup2fa(Request $request): JsonResponse
    {
        $user = $request->user();
        $secret = $this->totpService->generateSecret(32);
        $otpauthUri = $this->totpService->getOtpAuthUri('HUDORIAN', $user->email, $secret);

        // Cache pending secret for 15 minutes
        Cache::put('2fa_pending_' . $user->id, $secret, now()->addMinutes(15));

        return response()->json([
            'secret' => $secret,
            'otpauth_uri' => $otpauthUri,
            'qr_code_url' => 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' . rawurlencode($otpauthUri),
        ]);
    }

    /**
     * Confirm and activate Google Authenticator 2FA.
     */
    public function confirm2fa(Request $request): JsonResponse
    {
        $request->validate([
            'secret' => 'required|string',
            'code' => 'required|string',
        ]);

        $user = $request->user();

        if (! $this->totpService->verify($request->secret, $request->code)) {
            return response()->json([
                'message' => 'Invalid Google Authenticator code. Please check the current 6-digit code in your app.',
            ], 422);
        }

        $user->google2fa_secret = $request->secret;
        $user->google2fa_enabled = true;
        $user->google2fa_confirmed_at = now();
        $user->save();

        Cache::forget('2fa_pending_' . $user->id);

        return response()->json([
            'message' => 'Google Authenticator 2FA has been successfully activated for your account.',
            'google2fa_enabled' => true,
        ]);
    }

    /**
     * Disable Google Authenticator 2FA.
     */
    public function disable2fa(Request $request): JsonResponse
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $user = $request->user();

        if (! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Incorrect password confirmation.',
            ], 422);
        }

        $user->google2fa_enabled = false;
        $user->google2fa_secret = null;
        $user->google2fa_confirmed_at = null;
        $user->save();

        return response()->json([
            'message' => 'Google Authenticator 2FA has been disabled.',
            'google2fa_enabled' => false,
        ]);
    }

    /**
     * Get full security configuration for admin panel management.
     */
    public function getSecuritySettings(Request $request): JsonResponse
    {
        $user = $request->user();
        $settings = $this->captchaService->getSecuritySettings();

        return response()->json([
            'settings' => $settings,
            'current_admin_2fa' => [
                'enabled' => (bool) $user->google2fa_enabled,
                'confirmed_at' => $user->google2fa_confirmed_at,
            ],
        ]);
    }

    /**
     * Update security keys and CAPTCHA configuration from admin panel.
     */
    public function updateSecuritySettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'captcha_provider' => 'required|in:none,cloudflare_turnstile,google_recaptcha',
            'cloudflare_site_key' => 'nullable|string',
            'cloudflare_secret_key' => 'nullable|string',
            'google_recaptcha_site_key' => 'nullable|string',
            'google_recaptcha_secret_key' => 'nullable|string',
        ]);

        $block = CmsBlock::firstOrCreate(
            ['key' => 'security_settings'],
            [
                'title' => 'Security & Bot Protection Settings',
                'subtitle' => 'Cloudflare Turnstile, Google reCAPTCHA, and Multi-Factor Authentication',
                'body' => 'Configured via SecureGate Admin Panel',
            ]
        );

        $block->payload = array_merge($block->payload ?? [], $validated);
        $block->save();

        return response()->json([
            'message' => 'Security and CAPTCHA settings updated successfully.',
            'settings' => $block->payload,
        ]);
    }

    /**
     * Terminate active administrative session across devices.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user) {
            $this->secureGate->terminateAdminSession($user);
        }

        return response()->json([
            'message' => 'SecureGate session terminated.',
        ]);
    }

    /**
     * Get authenticated admin user profile.
     */
    public function getProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'admin' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'google2fa_enabled' => (bool) $user->google2fa_enabled,
                'created_at' => $user->created_at,
            ],
        ]);
    }

    /**
     * Update admin profile name, email, or password.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'current_password' => 'nullable|required_with:new_password|string',
            'new_password' => 'nullable|string|min:8|confirmed',
        ]);

        if (! empty($validated['new_password'])) {
            if (! Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'message' => 'The current password provided does not match our records.',
                    'errors' => ['current_password' => ['The current password is incorrect.']],
                ], 422);
            }
            $user->password = Hash::make($validated['new_password']);
        }

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->save();

        return response()->json([
            'message' => 'Administrator profile updated successfully.',
            'admin' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'google2fa_enabled' => (bool) $user->google2fa_enabled,
            ],
        ]);
    }
}
