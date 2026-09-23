<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DigitalCardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_member_can_retrieve_digital_card_with_signed_token(): void
    {
        $memberUser = User::where('email', 'member@hudorian.com')->first();
        $token = $memberUser->createToken('member-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/member/card');

        $response->assertStatus(200)
            ->assertJsonPath('member.membership_number', 'HUD-2026-8912')
            ->assertJsonStructure([
                'member' => ['name', 'membership_number', 'plan_name', 'status'],
                'card' => ['token', 'expires_at', 'verify_url'],
            ]);
    }

    public function test_can_verify_digital_card_token(): void
    {
        $memberUser = User::where('email', 'member@hudorian.com')->first();
        $token = $memberUser->createToken('member-token')->plainTextToken;

        $cardRes = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/member/card');

        $cardToken = $cardRes->json('card.token');

        // Test valid token verification
        $verifyRes = $this->getJson("/api/v1/verify-card/{$cardToken}");

        $verifyRes->assertStatus(200)
            ->assertJsonPath('valid', true)
            ->assertJsonPath('status', 'active');

        // Test forged / tampered token verification
        $tamperedToken = $cardToken . 'tampered';
        $tamperedRes = $this->getJson("/api/v1/verify-card/{$tamperedToken}");

        $tamperedRes->assertStatus(400)
            ->assertJsonPath('valid', false)
            ->assertJsonPath('status', 'tampered');
    }
}

