<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\Member;
use App\Models\MembershipPlan;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentGatewaysTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $memberUser;
    protected MembershipPlan $plan;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminUser = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $this->memberUser = User::factory()->create([
            'role' => 'member',
            'is_active' => true,
        ]);

        $this->plan = MembershipPlan::create([
            'name' => 'Resident Member',
            'slug' => 'resident-member',
            'description' => 'Local residency and house access',
            'price' => 3500.00,
            'currency' => 'EUR',
            'billing_period' => 'annual',
            'guest_allowance' => 1,
            'house_access_type' => 'local_only',
            'stay_discount_percent' => 10.00,
            'is_active' => true,
        ]);
    }

    public function test_can_fetch_public_payment_config(): void
    {
        $response = $this->getJson('/api/v1/payments/config');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'flutterwave' => ['enabled', 'public_key'],
                'paystack' => ['enabled', 'public_key'],
                'manual' => [
                    'enabled',
                    'bank_name',
                    'account_name',
                    'account_number',
                    'iban',
                    'swift_bic',
                    'instructions',
                ],
                'default_currency',
            ],
        ]);

        // Secret keys must never be exposed publicly
        $data = $response->json('data');
        $this->assertArrayNotHasKey('secret_key', $data['flutterwave']);
        $this->assertArrayNotHasKey('secret_key', $data['paystack']);
    }

    public function test_admin_can_view_and_update_payment_settings(): void
    {
        // 1. Fetch settings
        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/v1/admin/payments/settings');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'settings' => [
                'flutterwave_enabled',
                'flutterwave_public_key',
                'paystack_enabled',
                'manual_enabled',
            ],
        ]);

        // 2. Update settings
        $updateResponse = $this->actingAs($this->adminUser)
            ->putJson('/api/v1/admin/payments/settings', [
                'flutterwave_enabled' => true,
                'flutterwave_public_key' => 'FLWPUBK_TEST-12345678',
                'flutterwave_secret_key' => 'FLWSECK_TEST-abcdefgh',
                'paystack_enabled' => true,
                'paystack_public_key' => 'pk_test_87654321',
                'paystack_secret_key' => 'sk_test_12345678',
                'manual_enabled' => true,
                'manual_bank_name' => 'Heritage Private Bank',
                'manual_account_name' => 'HUDORIAN SANCTUARY PLC',
                'manual_account_number' => '99887766',
                'manual_iban' => 'GB99HERI20000099887766',
                'manual_swift_bic' => 'HERIGB2L',
                'manual_instructions' => 'Quote full name and dossier reference.',
            ]);

        $updateResponse->assertStatus(200);
        $this->assertTrue($updateResponse->json('settings.flutterwave_enabled'));
        $this->assertEquals('FLWPUBK_TEST-12345678', $updateResponse->json('settings.flutterwave_public_key'));
        $this->assertEquals('Heritage Private Bank', $updateResponse->json('settings.manual_bank_name'));
    }

    public function test_can_submit_manual_bank_wire_payment(): void
    {
        $response = $this->actingAs($this->memberUser)
            ->postJson('/api/v1/payments/initialize', [
                'gateway' => 'manual',
                'membership_plan_id' => $this->plan->id,
                'transfer_reference' => 'WIRE-TEST-9001',
                'sender_bank' => 'Barclays Private',
                'sender_account_name' => $this->memberUser->name,
                'proof_notes' => 'Transferred from private client account.',
            ]);

        $response->assertStatus(201);
        $response->assertJson([
            'success' => true,
            'gateway' => 'manual',
            'status' => 'pending',
        ]);

        $this->assertDatabaseHas('payments', [
            'user_id' => $this->memberUser->id,
            'provider' => 'manual_transfer',
            'status' => 'pending',
            'amount' => 3500.00,
        ]);
    }

    public function test_admin_can_approve_manual_transfer_and_activate_membership(): void
    {
        $payment = Payment::create([
            'transaction_id' => 'wire_test_12345',
            'user_id' => $this->memberUser->id,
            'payable_type' => MembershipPlan::class,
            'payable_id' => $this->plan->id,
            'amount' => 3500.00,
            'currency' => 'EUR',
            'provider' => 'manual_transfer',
            'status' => 'pending',
            'payment_method' => 'bank_transfer',
            'metadata' => [
                'plan_id' => $this->plan->id,
                'plan_name' => $this->plan->name,
                'transfer_reference' => 'WIRE-9999',
            ],
        ]);

        $response = $this->actingAs($this->adminUser)
            ->postJson("/api/v1/admin/payments/{$payment->id}/approve", [
                'notes' => 'Confirmed receipt in Barclays treasury account.',
            ]);

        $response->assertStatus(200);

        // Payment status must be paid
        $payment->refresh();
        $this->assertEquals('paid', $payment->status);
        $this->assertEquals('Confirmed receipt in Barclays treasury account.', $payment->metadata['admin_approval_notes']);

        // Member record must be created and active
        $member = Member::where('user_id', $this->memberUser->id)->first();
        $this->assertNotNull($member);
        $this->assertEquals('active', $member->status);
        $this->assertEquals($this->plan->id, $member->membership_plan_id);
        $this->assertTrue($member->expires_at->isFuture());

        // Invoice must be issued
        $this->assertDatabaseHas('invoices', [
            'payment_id' => $payment->id,
            'user_id' => $this->memberUser->id,
            'status' => 'paid',
        ]);
    }

    public function test_admin_can_reject_manual_payment(): void
    {
        $payment = Payment::create([
            'transaction_id' => 'wire_test_reject',
            'user_id' => $this->memberUser->id,
            'payable_type' => MembershipPlan::class,
            'payable_id' => $this->plan->id,
            'amount' => 3500.00,
            'currency' => 'EUR',
            'provider' => 'manual_transfer',
            'status' => 'pending',
            'payment_method' => 'bank_transfer',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->postJson("/api/v1/admin/payments/{$payment->id}/reject", [
                'reason' => 'Wire transfer reference not located on bank statement.',
            ]);

        $response->assertStatus(200);

        $payment->refresh();
        $this->assertEquals('rejected', $payment->status);
        $this->assertEquals('Wire transfer reference not located on bank statement.', $payment->metadata['rejection_reason']);
    }

    public function test_flutterwave_initialization_and_verification(): void
    {
        $initResponse = $this->actingAs($this->memberUser)
            ->postJson('/api/v1/payments/initialize', [
                'gateway' => 'flutterwave',
                'membership_plan_id' => $this->plan->id,
                'redirect_url' => 'https://www.hudorian.com/member/payments',
            ]);

        $initResponse->assertStatus(200);
        $this->assertTrue($initResponse->json('success'));
        $this->assertNotEmpty($initResponse->json('checkout_url'));
        $txRef = $initResponse->json('tx_ref');

        $this->assertDatabaseHas('payments', [
            'transaction_id' => $txRef,
            'provider' => 'flutterwave',
            'status' => 'pending',
        ]);

        // Verification simulation
        $verifyResponse = $this->actingAs($this->memberUser)
            ->postJson('/api/v1/payments/verify', [
                'gateway' => 'flutterwave',
                'transaction_id' => 'flw_sim_test_' . time(),
                'tx_ref' => $txRef,
            ]);

        $verifyResponse->assertStatus(200);
        $this->assertTrue($verifyResponse->json('success'));
    }

    public function test_paystack_initialization_and_verification(): void
    {
        $initResponse = $this->actingAs($this->memberUser)
            ->postJson('/api/v1/payments/initialize', [
                'gateway' => 'paystack',
                'membership_plan_id' => $this->plan->id,
                'redirect_url' => 'https://www.hudorian.com/member/payments',
            ]);

        $initResponse->assertStatus(200);
        $this->assertTrue($initResponse->json('success'));
        $this->assertNotEmpty($initResponse->json('authorization_url'));
        $reference = $initResponse->json('reference');

        $this->assertDatabaseHas('payments', [
            'transaction_id' => $reference,
            'provider' => 'paystack',
            'status' => 'pending',
        ]);

        // Verification simulation
        $verifyResponse = $this->actingAs($this->memberUser)
            ->postJson('/api/v1/payments/verify', [
                'gateway' => 'paystack',
                'reference' => 'pstk_sim_test_' . time(),
            ]);

        $verifyResponse->assertStatus(200);
        $this->assertTrue($verifyResponse->json('success'));
    }
}
