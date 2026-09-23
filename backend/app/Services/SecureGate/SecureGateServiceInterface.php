<?php

namespace App\Services\SecureGate;

use App\Models\User;

interface SecureGateServiceInterface
{
    /**
     * Authenticate an admin user against SecureGate credentials.
     *
     * @param string $email
     * @param string $password
     * @param string|null $mfaCode
     * @param array $deviceContext [ip, user_agent, session_id]
     * @return array [success => bool, user => ?User, requires_mfa => bool, mfa_token => ?string, error => ?string]
     */
    public function authenticateAdmin(string $email, string $password, ?string $mfaCode = null, array $deviceContext = []): array;

    /**
     * Verify a secondary MFA challenge code.
     *
     * @param string $mfaToken
     * @param string $code
     * @param array $deviceContext
     * @return array [success => bool, user => ?User, token => ?string, error => ?string]
     */
    public function verifyMfaChallenge(string $mfaToken, string $code, array $deviceContext = []): array;

    /**
     * Authorize an administrative action based on role/permission and context.
     *
     * @param User $adminUser
     * @param string $permission
     * @param array $context
     * @return bool
     */
    public function authorizeAction(User $adminUser, string $permission, array $context = []): bool;

    /**
     * Invalidate active admin sessions across devices.
     *
     * @param User $adminUser
     * @return bool
     */
    public function terminateAdminSession(User $adminUser): bool;

    /**
     * Verify that a given request payload or signature adheres to SecureGate gateway standards.
     *
     * @param string $signature
     * @param string $payload
     * @return bool
     */
    public function verifyGatewaySignature(string $signature, string $payload): bool;
}

