<?php

namespace Tests\Feature;

use App\Models\MembershipApplication;
use App\Models\MembershipPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MembershipTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_can_fetch_public_membership_plans(): void
    {
        $response = $this->getJson('/api/v1/membership/plans');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'slug', 'price', 'currency', 'perks', 'house_access_type'],
                ],
            ]);
    }

    public function test_can_submit_membership_application(): void
    {
        $plan = MembershipPlan::first();

        $payload = [
            'membership_plan_id' => $plan->id,
            'first_name' => 'Harrison',
            'last_name' => 'Sterling',
            'email' => 'harrison@sterling.co',
            'phone' => '+44 7700 900077',
            'city' => 'London',
            'country' => 'United Kingdom',
            'profession' => 'Art Gallerist',
            'company' => 'Sterling Fine Arts',
            'bio' => 'Curating international contemporary sculpture and minimal design for over a decade.',
            'interests' => ['Contemporary Art', 'Architecture', 'Sailing'],
        ];

        $response = $this->postJson('/api/v1/membership/apply', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('application.status', 'submitted');

        $this->assertDatabaseHas('membership_applications', [
            'email' => 'harrison@sterling.co',
            'first_name' => 'Harrison',
        ]);
    }

    public function test_admin_can_approve_application_and_activate_member(): void
    {
        $admin = User::where('role', 'super_admin')->first();
        $application = MembershipApplication::where('status', 'under_review')->first();

        $token = $admin->createToken('admin-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/v1/admin/applications/{$application->id}/review", [
                'decision' => 'approved',
                'notes' => 'Approved by membership council unanimously.',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'approved');

        $this->assertDatabaseHas('members', [
            'status' => 'active',
            'membership_plan_id' => $application->membership_plan_id,
        ]);
    }
}

