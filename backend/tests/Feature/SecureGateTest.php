<?php

namespace Tests\Feature;

use App\Models\User;
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

    public function test_admin_login_triggers_mfa_challenge(): void
    {
        $response = $this->postJson('/api/v1/admin/auth/login', [
            'email' => 'admin@hudorian.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'mfa_required')
            ->assertJsonPath('requires_mfa', true)
            ->assertJsonStructure(['mfa_token']);
    }

    public function test_admin_mfa_verification_issues_secure_session(): void
    {
        $loginRes = $this->postJson('/api/v1/admin/auth/login', [
            'email' => 'admin@hudorian.com',
            'password' => 'password123',
        ]);

        $mfaToken = $loginRes->json('mfa_token');

        $verifyRes = $this->postJson('/api/v1/admin/auth/verify-mfa', [
            'mfa_token' => $mfaToken,
            'code' => '888888',
        ]);

        $verifyRes->assertStatus(200)
            ->assertJsonStructure(['token', 'admin'])
            ->assertJsonPath('admin.role', 'super_admin');
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
}

