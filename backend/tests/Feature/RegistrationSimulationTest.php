<?php

namespace Tests\Feature;

use App\Mail\ApplicationReceivedMail;
use App\Mail\WelcomeMemberMail;
use App\Models\MembershipApplication;
use App\Models\MembershipPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class RegistrationSimulationTest extends TestCase
{
    use RefreshDatabase;

    protected MembershipPlan $plan;
    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $this->plan = MembershipPlan::create([
            'name' => 'Global House Patron',
            'slug' => 'global-house-patron',
            'description' => 'Unrestricted access to all global houses',
            'price' => 6000.00,
            'currency' => 'EUR',
            'billing_period' => 'annual',
            'guest_allowance' => 2,
            'house_access_type' => 'all_houses',
            'stay_discount_percent' => 20.00,
            'is_active' => true,
        ]);
    }

    /**
     * Test direct patron account registration.
     */
    public function test_direct_patron_registration_simulation(): void
    {
        Mail::fake();

        $userData = [
            'name' => 'Alexander Montgomery',
            'email' => 'alexander.montgomery@sanctuary.luxury',
            'password' => 'RoyalVault2026!#',
            'phone' => '+44 20 7946 0991',
            'city' => 'London',
            'country' => 'United Kingdom',
        ];

        // 1. Submit Registration
        $response = $this->postJson('/api/v1/auth/register', $userData);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'user' => ['id', 'name', 'email', 'role'],
            'token',
        ]);
        $this->assertEquals('alexander.montgomery@sanctuary.luxury', $response->json('user.email'));

        // 2. Verify User exists in database
        $this->assertDatabaseHas('users', [
            'email' => 'alexander.montgomery@sanctuary.luxury',
            'name' => 'Alexander Montgomery',
            'role' => 'member',
        ]);

        // 3. Verify Welcome Email dispatched
        Mail::assertSent(WelcomeMemberMail::class, function ($mail) {
            return $mail->hasTo('alexander.montgomery@sanctuary.luxury');
        });

        // 4. Verify Immediate Login with newly created credentials
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => 'alexander.montgomery@sanctuary.luxury',
            'password' => 'RoyalVault2026!#',
        ]);

        $loginResponse->assertStatus(200);
        $loginResponse->assertJsonStructure(['token', 'user']);

        // 5. Verify /auth/me with the issued bearer token
        $token = $loginResponse->json('token');
        $meResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/auth/me');

        $meResponse->assertStatus(200);
        $this->assertEquals('Alexander Montgomery', $meResponse->json('user.name'));
    }

    /**
     * Test validation failure on duplicate email.
     */
    public function test_registration_prevents_duplicate_email(): void
    {
        User::factory()->create([
            'email' => 'existing.patron@hudorian.com',
        ]);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Impostor User',
            'email' => 'existing.patron@hudorian.com',
            'password' => 'SecurePass123!',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    /**
     * Test validation failure on short password (< 8 chars).
     */
    public function test_registration_enforces_minimum_password_security(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'New Patron',
            'email' => 'shortpass@hudorian.com',
            'password' => '123',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }

    /**
     * Test full candidacy registration via /membership/apply.
     */
    public function test_candidacy_dossier_registration_and_activation_simulation(): void
    {
        Mail::fake();

        $candidacyData = [
            'membership_plan_id' => $this->plan->id,
            'first_name' => 'Victoria',
            'last_name' => 'Kensington',
            'email' => 'victoria.kensington@mayfair.co.uk',
            'password' => 'MayfairClearance2026!',
            'phone' => '+44 7911 123456',
            'city' => 'London',
            'country' => 'United Kingdom',
            'profession' => 'Architectural Historian',
            'company' => 'Kensington Heritage Trust',
            'bio' => 'Advising preservation of royal and neoclassical private estates across Europe.',
            'interests' => ['Architecture & Design', 'Fine Wine & Viticulture'],
        ];

        // 1. Submit Candidacy Dossier
        $applyResponse = $this->postJson('/api/v1/membership/apply', $candidacyData);

        $applyResponse->assertStatus(201);
        $applyResponse->assertJsonPath('application.status', 'submitted');
        $applicationId = $applyResponse->json('application.id');

        // 2. Verify Application and User created in database
        $this->assertDatabaseHas('membership_applications', [
            'id' => $applicationId,
            'email' => 'victoria.kensington@mayfair.co.uk',
            'status' => 'submitted',
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'victoria.kensington@mayfair.co.uk',
            'name' => 'Victoria Kensington',
        ]);

        // 3. Verify Candidacy Received confirmation email dispatched
        Mail::assertSent(ApplicationReceivedMail::class, function ($mail) {
            return $mail->hasTo('victoria.kensington@mayfair.co.uk');
        });

        // 4. Candidate can log in immediately to portal
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => 'victoria.kensington@mayfair.co.uk',
            'password' => 'MayfairClearance2026!',
        ]);

        $loginResponse->assertStatus(200);

        // 5. Admin reviews and approves the application
        $application = MembershipApplication::findOrFail($applicationId);
        $reviewResponse = $this->actingAs($this->admin)
            ->postJson("/api/v1/admin/applications/{$application->id}/review", [
                'decision' => 'approved',
                'notes' => 'Candidacy vetted and confirmed by Admissions Committee.',
            ]);

        $reviewResponse->assertStatus(200);
        $reviewResponse->assertJsonPath('data.status', 'approved');

        // 6. Verify Member record is now active with expiration in future
        $candidateUser = User::where('email', 'victoria.kensington@mayfair.co.uk')->first();
        $this->assertNotNull($candidateUser->member);
        $this->assertEquals('active', $candidateUser->member->status);
        $this->assertTrue($candidateUser->member->expires_at->isFuture());

        // 7. Verify Welcome Member email dispatched upon approval
        Mail::assertSent(WelcomeMemberMail::class, function ($mail) {
            return $mail->hasTo('victoria.kensington@mayfair.co.uk');
        });
    }
}
