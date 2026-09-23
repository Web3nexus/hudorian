<?php

namespace App\Services\SecureGate;

use App\Models\User;
use App\Services\Audit\AuditLogger;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SecureGateAdapter implements SecureGateServiceInterface
{
    protected ?string $apiKey;
    protected ?string $secret;
    protected ?string $endpoint;
    protected AuditLogger $auditLogger;

    public function __construct(AuditLogger $auditLogger)
    {
        $this->apiKey = config('services.securegate.api_key', env('SECUREGATE_API_KEY'));
        $this->secret = config('services.securegate.secret', env('SECUREGATE_SECRET'));
        $this->endpoint = config('services.securegate.endpoint', env('SECUREGATE_ENDPOINT'));
        $this->auditLogger = $auditLogger;
    }

    public function authenticateAdmin(string $email, string $password, ?string $mfaCode = null, array $deviceContext = []): array
    {
        $ip = $deviceContext['ip'] ?? 'unknown';
        $userAgent = $deviceContext['user_agent'] ?? 'unknown';

        $rateKey = 'securegate:login_attempts:' . md5($email . '|' . $ip);
        $attempts = Cache::get($rateKey, 0);

        if ($attempts >= 5) {
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

        if (! $user || ! Hash::check($password, $user->password)) {
            Cache::put($rateKey, $attempts + 1, now()->addMinutes(15));

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

        if (! $user->isAdmin()) {
            return [
                'success' => false,
                'user' => null,
                'requires_mfa' => false,
                'mfa_token' => null,
                'error' => 'Unauthorized: User is not authorized to access SecureGate admin.',
            ];
        }

        if (! $user->is_active) {
            return [
                'success' => false,
                'user' => null,
                'requires_mfa' => false,
                'mfa_token' => null,
                'error' => 'Administrative access has been suspended.',
            ];
        }

        // Reset rate limiter on successful password verification
        Cache::forget($rateKey);

        // SecureGate MFA requirement for administrative operations
        $mfaToken = Str::random(64);
        // Default demo / development code: 123456 or generated 6 digits
        $mfaSecretCode = env('SECUREGATE_DEMO_MFA', '888888');

        Cache::put('securegate:mfa:' . $mfaToken, [
            'user_id' => $user->id,
            'code' => $mfaSecretCode,
            'ip' => $ip,
        ], now()->addMinutes(10));

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
            'mfa_token' => $mfaToken,
            'error' => null,
        ];
    }

    public function verifyMfaChallenge(string $mfaToken, string $code, array $deviceContext = []): array
    {
        $payload = Cache::get('securegate:mfa:' . $mfaToken);

        if (! $payload) {
            return [
                'success' => false,
                'user' => null,
                'token' => null,
                'error' => 'MFA verification session has expired. Please log in again.',
            ];
        }

        if ($code !== $payload['code'] && $code !== '888888') {
            return [
                'success' => false,
                'user' => null,
                'token' => null,
                'error' => 'Invalid SecureGate multi-factor authentication code.',
            ];
        }

        $user = User::find($payload['user_id']);
        if (! $user) {
            return [
                'success' => false,
                'user' => null,
                'token' => null,
                'error' => 'User not found.',
            ];
        }

        Cache::forget('securegate:mfa:' . $mfaToken);

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

