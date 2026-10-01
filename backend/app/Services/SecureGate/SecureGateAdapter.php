<?php

namespace App\Services\SecureGate;

use App\Models\User;
use App\Services\Audit\AuditLogger;
use App\Services\Security\TotpService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SecureGateAdapter implements SecureGateServiceInterface
{
    /**
     * Wrong codes tolerated against a single MFA challenge before it is burned.
     * A TOTP is six digits, so an uncapped challenge is a free brute-force of a
     * million combinations for anyone who reaches this step.
     */
    protected const MFA_MAX_ATTEMPTS = 5;

    /**
     * Lifetime of an MFA challenge. Deliberately short: the code itself only
     * stays valid for a 30-second window.
     */
    protected const MFA_CHALLENGE_MINUTES = 10;

    /**
     * Failed password attempts tolerated per account, independent of source IP.
     */
    protected const ACCOUNT_MAX_ATTEMPTS = 10;

    protected const ACCOUNT_LOCK_MINUTES = 15;

    protected ?string $apiKey;

    protected ?string $secret;

    protected ?string $endpoint;

    protected AuditLogger $auditLogger;

    protected TotpService $totpService;

    public function __construct(AuditLogger $auditLogger, TotpService $totpService)
    {
        $this->apiKey = config('services.securegate.api_key', env('SECUREGATE_API_KEY'));
        $this->secret = config('services.securegate.secret', env('SECUREGATE_SECRET'));
        $this->endpoint = config('services.securegate.endpoint', env('SECUREGATE_ENDPOINT'));
        $this->auditLogger = $auditLogger;
        $this->totpService = $totpService;
    }

    /**
     * Count a failed clearance attempt against both the request pair and the
     * account, so neither address spraying nor IP rotation resets the budget.
     */
    protected function registerFailedAttempt(string $rateKey, string $accountKey): void
    {
        $attempts = Cache::get($rateKey, 0) + 1;
        Cache::put($rateKey, $attempts, now()->addMinutes(15));

        $accountAttempts = Cache::get($accountKey, 0) + 1;
        Cache::put($accountKey, $accountAttempts, now()->addMinutes(self::ACCOUNT_LOCK_MINUTES));
    }

    public function authenticateAdmin(string $email, string $password, ?string $mfaCode = null, array $deviceContext = []): array
    {
        $ip = $deviceContext['ip'] ?? 'unknown';
        $userAgent = $deviceContext['user_agent'] ?? 'unknown';

        $rateKey = 'securegate:login_attempts:'.md5($email.'|'.$ip);
        // The per-pair counter above can be sidestepped by rotating source
        // addresses, so a second counter is kept on the account itself. Without
        // it, a botnet gets unlimited guesses against a known admin address.
        $accountKey = 'securegate:account_attempts:'.md5(strtolower(trim($email)));
        $attempts = Cache::get($rateKey, 0);
        $accountAttempts = Cache::get($accountKey, 0);

        if ($attempts >= 5 || $accountAttempts >= self::ACCOUNT_MAX_ATTEMPTS) {
            $this->auditLogger->log(
                null,
                'admin.login_blocked',
                'User',
                null,
                [
                    'email' => $email,
                    'reason' => 'Rate limit exceeded (5 attempts)',
                    'ip' => $ip,
                ]
            );

            return [
                'success' => false,
                'user' => null,
                'requires_mfa' => false,
                'mfa_token' => null,
                'error' => 'Too many failed login attempts. Account temporarily locked for 15 minutes.',
            ];
        }

        $user = User::where('email', $email)->first();

        // Hash even when the account is unknown, so a missing address costs the
        // same time as a wrong keyphrase and cannot be used to enumerate admins.
        $passwordValid = $user
            ? Hash::check($password, $user->password)
            : (Hash::check($password, '$2y$12$'.str_repeat('a', 53)) && false);

        if (! $user || ! $passwordValid) {
            $this->registerFailedAttempt($rateKey, $accountKey);

            $this->auditLogger->log(
                $user,
                'admin.login_failed',
                'User',
                $user?->id,
                ['email' => $email, 'ip' => $ip]
            );

            return [
                'success' => false,
                'user' => null,
                'requires_mfa' => false,
                'mfa_token' => null,
                'error' => 'Invalid administrative credentials.',
            ];
        }

        // A non-admin and a suspended account get the same wording as a wrong
        // password, and are counted as attempts, so the response cannot be used
        // to discover which addresses hold an administrator role.
        if (! $user->isAdmin()) {
            $this->registerFailedAttempt($rateKey, $accountKey);

            $this->auditLogger->log(
                $user,
                'admin.login_failed',
                'User',
                $user->id,
                ['email' => $email, 'ip' => $ip, 'reason' => 'not_an_admin']
            );

            return [
                'success' => false,
                'user' => null,
                'requires_mfa' => false,
                'mfa_token' => null,
                'error' => 'Invalid administrative credentials.',
            ];
        }

        if (! $user->is_active) {
            $this->registerFailedAttempt($rateKey, $accountKey);

            $this->auditLogger->log(
                $user,
                'admin.login_failed',
                'User',
                $user->id,
                ['email' => $email, 'ip' => $ip, 'reason' => 'suspended']
            );

            return [
                'success' => false,
                'user' => null,
                'requires_mfa' => false,
                'mfa_token' => null,
                'error' => 'Invalid administrative credentials.',
            ];
        }

        // Reset rate limiter on successful password verification
        Cache::forget($rateKey);
        Cache::forget($accountKey);

        // If Google Authenticator 2FA is NOT enabled on this admin, grant access immediately
        if (! $user->google2fa_enabled) {
            $token = $user->createToken('securegate-admin-session', ['admin:*'], now()->addHours(8))->plainTextToken;

            $this->auditLogger->log(
                $user,
                'admin.login_success',
                'User',
                $user->id,
                ['ip' => $ip, 'user_agent' => $userAgent, 'mfa' => 'disabled']
            );

            return [
                'success' => true,
                'user' => $user,
                'requires_mfa' => false,
                'token' => $token,
                'mfa_token' => null,
                'error' => null,
            ];
        }

        // If 2FA is enabled, generate MFA challenge session
        $mfaToken = Str::random(64);

        Cache::put('securegate:mfa:'.$mfaToken, [
            'user_id' => $user->id,
            'ip' => $ip,
            'attempts' => 0,
        ], now()->addMinutes(self::MFA_CHALLENGE_MINUTES));

        $this->auditLogger->log(
            $user,
            'admin.mfa_challenged',
            'User',
            $user->id,
            ['ip' => $ip, 'user_agent' => $userAgent]
        );

        return [
            'success' => true,
            'user' => $user,
            'requires_mfa' => true,
            'token' => null,
            'mfa_token' => $mfaToken,
            'error' => null,
        ];
    }

    public function verifyMfaChallenge(string $mfaToken, string $code, array $deviceContext = []): array
    {
        $challengeKey = 'securegate:mfa:'.$mfaToken;
        $payload = Cache::get($challengeKey);

        if (! $payload) {
            return [
                'success' => false,
                'user' => null,
                'token' => null,
                'error' => 'MFA verification session has expired. Please log in again.',
            ];
        }

        // The challenge records the address that requested it. Without this
        // check a challenge is a portable bearer credential: stealing it is
        // enough to clear the second factor from anywhere.
        $currentIp = $deviceContext['ip'] ?? 'unknown';
        if (! empty($payload['ip']) && $payload['ip'] !== 'unknown' && $payload['ip'] !== $currentIp) {
            Cache::forget($challengeKey);

            $this->auditLogger->log(
                User::find($payload['user_id']),
                'admin.mfa_ip_mismatch',
                'User',
                $payload['user_id'],
                ['challenge_ip' => $payload['ip'], 'request_ip' => $currentIp]
            );

            return [
                'success' => false,
                'user' => null,
                'token' => null,
                'error' => 'This verification session was started from a different location. Please log in again.',
            ];
        }

        $user = User::find($payload['user_id']);
        if (! $user) {
            Cache::forget($challengeKey);

            return [
                'success' => false,
                'user' => null,
                'token' => null,
                'error' => 'MFA verification session has expired. Please log in again.',
            ];
        }

        $attempts = (int) ($payload['attempts'] ?? 0) + 1;

        // Validate using RFC 6238 TOTP Google Authenticator service
        if (empty($user->google2fa_secret) || ! $this->totpService->verify($user->google2fa_secret, $code)) {
            // Burn the challenge once the budget is spent, so the six-digit
            // space cannot be walked one guess at a time for the full lifetime
            // of the challenge.
            if ($attempts >= self::MFA_MAX_ATTEMPTS) {
                Cache::forget($challengeKey);

                $this->auditLogger->log(
                    $user,
                    'admin.mfa_locked',
                    'User',
                    $user->id,
                    ['ip' => $currentIp, 'attempts' => $attempts]
                );

                return [
                    'success' => false,
                    'user' => null,
                    'token' => null,
                    'error' => 'Too many invalid verification codes. This session has been closed; please log in again.',
                ];
            }

            Cache::put($challengeKey, [
                ...$payload,
                'attempts' => $attempts,
            ], now()->addMinutes(self::MFA_CHALLENGE_MINUTES));

            $this->auditLogger->log(
                $user,
                'admin.mfa_failed',
                'User',
                $user->id,
                ['ip' => $currentIp, 'attempts' => $attempts]
            );

            return [
                'success' => false,
                'user' => null,
                'token' => null,
                'error' => 'Invalid Google Authenticator code. Please check your app and try again.',
            ];
        }

        // Single use: a valid code retires the challenge, and the same code
        // cannot be replayed to mint a second admin token.
        Cache::forget($challengeKey);

        // Issue Sanctum token with admin abilities
        $token = $user->createToken('securegate-admin-session', ['admin:*'], now()->addHours(8))->plainTextToken;

        $this->auditLogger->log(
            $user,
            'admin.login_success',
            'User',
            $user->id,
            ['ip' => $deviceContext['ip'] ?? 'unknown', 'mfa_method' => 'SecureGate-TOTP']
        );

        return [
            'success' => true,
            'user' => $user,
            'token' => $token,
            'error' => null,
        ];
    }

    public function authorizeAction(User $adminUser, string $permission, array $context = []): bool
    {
        if ($adminUser->isSuperAdmin()) {
            return true;
        }

        // Granular RBAC definitions
        $rolePermissions = [
            'admin' => ['members.*', 'applications.*', 'houses.*', 'rooms.*', 'events.*', 'cms.*', 'payments.view'],
            'house_manager' => ['houses.view', 'houses.update', 'rooms.*', 'events.*'],
            'membership_manager' => ['members.*', 'applications.*', 'plans.*'],
            'finance_manager' => ['payments.*', 'invoices.*', 'refunds.*', 'members.view'],
            'staff' => ['members.view', 'bookings.view', 'events.view'],
        ];

        $allowed = $rolePermissions[$adminUser->role] ?? [];

        foreach ($allowed as $pattern) {
            if ($pattern === '*' || $pattern === $permission) {
                return true;
            }
            if (str_ends_with($pattern, '.*')) {
                $prefix = substr($pattern, 0, -2);
                if (str_starts_with($permission, $prefix)) {
                    return true;
                }
            }
        }

        $this->auditLogger->log(
            $adminUser,
            'admin.authorization_denied',
            'Permission',
            null,
            ['permission' => $permission, 'context' => $context]
        );

        return false;
    }

    public function terminateAdminSession(User $adminUser): bool
    {
        $adminUser->tokens()->where('name', 'securegate-admin-session')->delete();

        $this->auditLogger->log(
            $adminUser,
            'admin.session_terminated',
            'User',
            $adminUser->id
        );

        return true;
    }

    public function verifyGatewaySignature(string $signature, string $payload): bool
    {
        if (empty($this->secret)) {
            return true; // Development mode
        }

        $expected = hash_hmac('sha256', $payload, $this->secret);

        return hash_equals($expected, $signature);
    }
}
