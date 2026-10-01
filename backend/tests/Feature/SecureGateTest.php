<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\Security\TotpService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
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

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
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

    public function test_admin_login_failures_are_locked_out(): void
    {
        // Five wrong keyphrases, then the correct one must still be refused:
        // a lockout that resets on the next guess is not a lockout. The route
        // ceiling sits at eight, so the account lockout is what answers here.
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/admin/auth/login', [
                'email' => 'admin@hudorian.com',
                'password' => 'wrong-keyphrase',
            ])->assertStatus(401);
        }

        $this->postJson('/api/v1/admin/auth/login', [
            'email' => 'admin@hudorian.com',
            'password' => 'password123',
        ])->assertStatus(401)
            ->assertJsonPath('message', 'Too many failed login attempts. Account temporarily locked for 15 minutes.');
    }

    public function test_the_admin_lockout_survives_a_change_of_source_address(): void
    {
        // The per-request counter is keyed on address, so a rotating attacker
        // would otherwise get a fresh budget on every hop. The account counter
        // is what has to stop it.
        $admin = User::where('email', 'admin@hudorian.com')->first();
        $accountKey = 'securegate:account_attempts:'.md5('admin@hudorian.com');

        for ($i = 0; $i < 10; $i++) {
            Cache::put($accountKey, $i + 1, now()->addMinutes(15));
        }

        $this->postJson('/api/v1/admin/auth/login', [
            'email' => 'admin@hudorian.com',
            'password' => 'password123',
        ])->assertStatus(401)
            ->assertJsonPath('error', 'Authentication Failed')
            ->assertJsonPath('message', 'Too many failed login attempts. Account temporarily locked for 15 minutes.');
    }

    public function test_a_successful_login_clears_the_account_lockout(): void
    {
        $accountKey = 'securegate:account_attempts:'.md5('admin@hudorian.com');
        Cache::put($accountKey, 3, now()->addMinutes(15));

        $this->postJson('/api/v1/admin/auth/login', [
            'email' => 'admin@hudorian.com',
            'password' => 'password123',
        ])->assertStatus(200);

        $this->assertSame(0, Cache::get($accountKey, 0));
    }

    public function test_login_responses_cannot_be_used_to_enumerate_administrators(): void
    {
        // An unknown address, a real non-admin, and a suspended admin must all
        // be indistinguishable, or the response becomes a role-discovery oracle.
        $unknown = $this->postJson('/api/v1/admin/auth/login', [
            'email' => 'nobody@hudorian.com',
            'password' => 'whatever-keyphrase',
        ]);

        $member = User::where('role', 'member')->first();
        $nonAdmin = $this->postJson('/api/v1/admin/auth/login', [
            'email' => $member->email,
            'password' => 'whatever-keyphrase',
        ]);

        $admin = User::where('email', 'admin@hudorian.com')->first();
        $admin->is_active = false;
        $admin->save();
        $suspended = $this->postJson('/api/v1/admin/auth/login', [
            'email' => 'admin@hudorian.com',
            'password' => 'password123',
        ]);

        foreach ([$unknown, $nonAdmin, $suspended] as $response) {
            $response->assertStatus(401);
        }

        $this->assertSame(
            $unknown->json('message'),
            $nonAdmin->json('message'),
            'A non-admin address must not be distinguishable from an unknown one.'
        );
        $this->assertSame(
            $unknown->json('message'),
            $suspended->json('message'),
            'A suspended administrator must not be distinguishable from an unknown address.'
        );
    }

    public function test_admin_login_is_rate_limited_by_the_router(): void
    {
        // The service-level lockout is metered per identifier; this guards the
        // surrounding route so a spray across many addresses, each with its own
        // budget, still runs into the per-address ceiling.
        for ($i = 0; $i < 15; $i++) {
            $this->postJson('/api/v1/admin/auth/login', [
                'email' => 'spray-'.$i.'@hudorian.com',
                'password' => 'wrong-keyphrase',
            ]);
        }

        $this->postJson('/api/v1/admin/auth/login', [
            'email' => 'spray-99@hudorian.com',
            'password' => 'wrong-keyphrase',
        ])->assertStatus(429)
            ->assertJsonPath('error', 'Too Many Attempts')
            ->assertJsonPath('context', 'admin-login');
    }

    public function test_member_login_is_rate_limited(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/login', [
                'email' => 'member@hudorian.com',
                'password' => 'wrong-keyphrase',
            ]);
        }

        $this->postJson('/api/v1/auth/login', [
            'email' => 'member@hudorian.com',
            'password' => 'password123',
        ])->assertStatus(429);
    }

    public function test_an_mfa_challenge_is_burned_after_repeated_wrong_codes(): void
    {
        // A six-digit code is a million guesses. Without a cap the challenge can
        // be walked for its full lifetime, so the budget must burn it.
        $totpService = app(TotpService::class);
        $secret = $totpService->generateSecret(32);

        $admin = User::where('email', 'admin@hudorian.com')->first();
        $admin->google2fa_secret = $secret;
        $admin->google2fa_enabled = true;
        $admin->save();

        $mfaToken = $this->postJson('/api/v1/admin/auth/login', [
            'email' => 'admin@hudorian.com',
            'password' => 'password123',
        ])->json('mfa_token');

        for ($i = 0; $i < 4; $i++) {
            $this->postJson('/api/v1/admin/auth/verify-mfa', [
                'mfa_token' => $mfaToken,
                'code' => '000000',
            ])->assertStatus(422);
        }

        // The fifth wrong code retires the challenge...
        $this->postJson('/api/v1/admin/auth/verify-mfa', [
            'mfa_token' => $mfaToken,
            'code' => '000000',
        ])->assertStatus(422);

        // ...so the genuine code no longer opens the panel.
        $this->postJson('/api/v1/admin/auth/verify-mfa', [
            'mfa_token' => $mfaToken,
            'code' => $totpService->calculateCode($secret),
        ])->assertStatus(422)
            ->assertJsonPath('error', 'MFA Verification Failed');
    }

    public function test_an_mfa_code_cannot_be_replayed(): void
    {
        $totpService = app(TotpService::class);
        $secret = $totpService->generateSecret(32);

        $admin = User::where('email', 'admin@hudorian.com')->first();
        $admin->google2fa_secret = $secret;
        $admin->google2fa_enabled = true;
        $admin->save();

        $mfaToken = $this->postJson('/api/v1/admin/auth/login', [
            'email' => 'admin@hudorian.com',
            'password' => 'password123',
        ])->json('mfa_token');

        $this->postJson('/api/v1/admin/auth/verify-mfa', [
            'mfa_token' => $mfaToken,
            'code' => $totpService->calculateCode($secret),
        ])->assertStatus(200);

        $this->postJson('/api/v1/admin/auth/verify-mfa', [
            'mfa_token' => $mfaToken,
            'code' => $totpService->calculateCode($secret),
        ])->assertStatus(422)
            ->assertJsonPath('message', 'MFA verification session has expired. Please log in again.');
    }

    public function test_an_mfa_challenge_cannot_be_completed_from_another_address(): void
    {
        // The challenge records the address that asked for it. Without that
        // binding, stealing the token is enough to clear the second factor.
        $totpService = app(TotpService::class);
        $secret = $totpService->generateSecret(32);

        $admin = User::where('email', 'admin@hudorian.com')->first();
        $admin->google2fa_secret = $secret;
        $admin->google2fa_enabled = true;
        $admin->save();

        $mfaToken = $this->postJson('/api/v1/admin/auth/login', [
            'email' => 'admin@hudorian.com',
            'password' => 'password123',
        ])->json('mfa_token');

        $this->postJson('/api/v1/admin/auth/verify-mfa', [
            'mfa_token' => $mfaToken,
            'code' => $totpService->calculateCode($secret),
        ], ['REMOTE_ADDR' => '203.0.113.9'])
            ->assertStatus(422)
            ->assertJsonPath('message', 'This verification session was started from a different location. Please log in again.');
    }

    public function test_a_member_session_token_expires(): void
    {
        $this->postJson('/api/v1/auth/login', [
            'email' => 'member@hudorian.com',
            'password' => 'password123',
        ])->assertStatus(200);

        $token = App\Models\PersonalAccessToken::latest('id')->first();

        $this->assertNotNull(
            $token->expires_at,
            'A member token issued without an expiry stays valid forever.'
        );
    }
}
