<?php

namespace Tests\Feature;

use App\Models\MembershipPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CurrencyRateTest extends TestCase
{
    use RefreshDatabase;

    public function test_rates_endpoint_returns_exchangerate_api_for_manual(): void
    {
        $response = $this->getJson('/api/v1/currency/rates?gateway=manual&base=EUR');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'data' => [
                    'base',
                    'provider',
                    'rates' => [
                        'EUR',
                        'NGN',
                        'USD',
                        'GBP',
                    ],
                    'updated_at',
                    'is_live',
                ],
            ]);

        $this->assertStringContainsString('ExchangeRate-API', $response->json('data.provider'));
    }

    public function test_rates_endpoint_returns_flutterwave_rates(): void
    {
        $response = $this->getJson('/api/v1/currency/rates?gateway=flutterwave&base=EUR');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $this->assertStringContainsString('Flutterwave', $response->json('data.provider'));
    }

    public function test_rates_endpoint_returns_paystack_rates(): void
    {
        $response = $this->getJson('/api/v1/currency/rates?gateway=paystack&base=EUR');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $this->assertStringContainsString('Paystack', $response->json('data.provider'));
    }

    public function test_convert_endpoint_computes_currency_conversion(): void
    {
        $response = $this->getJson('/api/v1/currency/convert?amount=100&from=EUR&to=NGN&gateway=manual');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.original_amount', 100)
            ->assertJsonPath('data.original_currency', 'EUR')
            ->assertJsonPath('data.target_currency', 'NGN');

        $this->assertGreaterThan(0, $response->json('data.target_amount'));
        $this->assertGreaterThan(0, $response->json('data.rate'));
    }

    public function test_manual_payment_initialization_converts_amount_to_ngn_using_exchangerate_api(): void
    {
        $user = User::factory()->create(['role' => 'member']);
        $plan = MembershipPlan::create([
            'name' => 'Royal Luminary',
            'slug' => 'royal-luminary',
            'tier_level' => 1,
            'description' => 'Test membership plan description',
            'price' => 3500.00,
            'currency' => 'EUR',
            'billing_period' => 'annually',
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)->postJson('/api/v1/payments/initialize', [
            'gateway' => 'manual',
            'membership_plan_id' => $plan->id,
            'currency' => 'NGN',
            'transfer_reference' => 'WIRE-TEST-1234',
            'sender_bank' => 'Guaranty Trust Bank',
            'sender_account_name' => 'Vincent Luxury Holdings',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('gateway', 'manual')
            ->assertJsonPath('payment.currency', 'NGN');

        $this->assertGreaterThan(3500, $response->json('payment.amount'));
        $this->assertStringContainsString('ExchangeRate-API', $response->json('payment.rate_provider'));
        $this->assertGreaterThan(0, $response->json('payment.exchange_rate'));

        $this->assertDatabaseHas('payments', [
            'currency' => 'NGN',
            'provider' => 'manual_transfer',
            'status' => 'pending',
        ]);
    }

    public function test_flutterwave_payment_initialization_converts_amount(): void
    {
        $user = User::factory()->create(['role' => 'member']);
        $plan = MembershipPlan::create([
            'name' => 'Patron Founder',
            'slug' => 'patron-founder',
            'tier_level' => 2,
            'description' => 'Patron Founder description',
            'price' => 5000.00,
            'currency' => 'EUR',
            'billing_period' => 'annually',
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)->postJson('/api/v1/payments/initialize', [
            'gateway' => 'flutterwave',
            'membership_plan_id' => $plan->id,
            'currency' => 'USD',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('gateway', 'flutterwave')
            ->assertJsonPath('currency', 'USD');

        $this->assertStringContainsString('Flutterwave', $response->json('rate_provider'));
        $this->assertGreaterThan(0, $response->json('amount'));
    }

    public function test_paystack_payment_initialization_converts_amount(): void
    {
        $user = User::factory()->create(['role' => 'member']);
        $plan = MembershipPlan::create([
            'name' => 'Sovereign Circle',
            'slug' => 'sovereign-circle',
            'tier_level' => 3,
            'description' => 'Sovereign Circle description',
            'price' => 7500.00,
            'currency' => 'EUR',
            'billing_period' => 'annually',
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)->postJson('/api/v1/payments/initialize', [
            'gateway' => 'paystack',
            'membership_plan_id' => $plan->id,
            'currency' => 'NGN',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('gateway', 'paystack')
            ->assertJsonPath('currency', 'NGN');

        $this->assertStringContainsString('Paystack', $response->json('rate_provider'));
        $this->assertGreaterThan(7500, $response->json('amount'));
    }
}
