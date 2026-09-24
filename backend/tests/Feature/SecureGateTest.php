<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\Security\TotpService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecureGateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_public_security_config_returns_default_none(): void
    {
        $response = $this->getJson('/api/v1/security/config');

        $response->assertStatus(200)
            ->assertJsonPath('captcha_provider', 'none');
    }

    public function test_admin_login_without_2fa_grants_immediate_access(): void
    {
        $response = $this->postJson('/api/v1/admin/auth/login', [
            'email' => 'admin@hudorian.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('requires_mfa', false)
            ->assertJsonStructure(['token', 'admin'])
            ->assertJsonPath('admin.role', 'super_admin');
    }

    public function test_admin_with_2fa_enabled_challenges_and_verifies_totp(): void
    {
        $totpService = app(TotpService::class);
        $secret = $totpService->generateSecret(32);

        $admin = User::where('email', 'admin@hudorian.com')->first();
        $admin->google2fa_secret = $secret;
        $admin->google2fa_enabled = true;
        $admin->google2fa_confirmed_at = now();
        $admin->save();

        $loginRes = $this->postJson('/api/v1/admin/auth/login', [
            'email' => 'admin@hudorian.com',
            'password' => 'password123',
        ]);

        $loginRes->assertStatus(200)
            ->assertJsonPath('status', 'mfa_required')
            ->assertJsonPath('requires_mfa', true)
            ->assertJsonStructure(['mfa_token']);

        $mfaToken = $loginRes->json('mfa_token');
        $validCode = $totpService->calculateCode($secret);

        $verifyRes = $this->postJson('/api/v1/admin/auth/verify-mfa', [
            'mfa_token' => $mfaToken,
            'code' => $validCode,
        ]);

        $verifyRes->assertStatus(200)
            ->assertJsonStructure(['token', 'admin'])
            ->assertJsonPath('admin.role', 'super_admin');
    }

    public function test_admin_2fa_rejects_invalid_code(): void
    {
        $totpService = app(TotpService::class);
        $secret = $totpService->generateSecret(32);

        $admin = User::where('email', 'admin@hudorian.com')->first();
        $admin->google2fa_secret = $secret;
        $admin->google2fa_enabled = true;
        $admin->save();

        $loginRes = $this->postJson('/api/v1/admin/auth/login', [
            'email' => 'admin@hudorian.com',
            'password' => 'password123',
        ]);

        $mfaToken = $loginRes->json('mfa_token');

        $verifyRes = $this->postJson('/api/v1/admin/auth/verify-mfa', [
            'mfa_token' => $mfaToken,
            'code' => '999999',
        ]);

        $verifyRes->assertStatus(422)
            ->assertJsonPath('error', 'MFA Verification Failed');
    }

    public function test_non_admin_cannot_access_securegate_routes(): void
    {
        $regularUser = User::where('role', 'member')->first();
        $token = $regularUser->createToken('regular-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/admin/dashboard/stats');

        $response->assertStatus(403)
            ->assertJsonPath('error', 'Forbidden');
    }

    public function test_admin_can_view_and_update_profile_name(): void
    {
        $admin = User::where('email', 'admin@hudorian.com')->first();

        // 1. Get profile
        $getRes = $this->actingAs($admin)
            ->getJson('/api/v1/admin/profile');

        $getRes->assertStatus(200)
            ->assertJsonPath('admin.name', $admin->name);

        // 2. Update profile name
        $updateRes = $this->actingAs($admin)
            ->putJson('/api/v1/admin/profile', [
                'name' => 'Vincent Sovereign Steward',
                'email' => 'admin@hudorian.com',
            ]);

        $updateRes->assertStatus(200)
            ->assertJsonPath('admin.name', 'Vincent Sovereign Steward');

        $this->assertDatabaseHas('users', [
            'id' => $admin->id,
            'name' => 'Vincent Sovereign Steward',
        ]);
    }
}
