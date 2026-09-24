<?php

namespace Tests\Feature;

use App\Mail\ResetPasswordMail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_forgot_password_dispatches_email_and_stores_token(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'member@hudorian.com',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['message']);

        // Assert record created in password_reset_tokens table
        $this->assertDatabaseHas('password_reset_tokens', [
            'email' => 'member@hudorian.com',
        ]);

        // Assert email was sent
        Mail::assertSent(ResetPasswordMail::class, function ($mail) {
            return $mail->hasTo('member@hudorian.com');
        });
    }

    public function test_forgot_password_returns_generic_success_for_unknown_email(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'nonexistent@hudorian.com',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['message']);

        Mail::assertNothingSent();
    }

    public function test_reset_password_updates_user_password_and_cleans_token(): void
    {
        $user = User::where('email', 'member@hudorian.com')->first();
        $rawToken = Str::random(64);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => Hash::make($rawToken),
                'created_at' => now(),
            ]
        );

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'member@hudorian.com',
            'token' => $rawToken,
            'password' => 'NewClearancePass123!',
            'password_confirmation' => 'NewClearancePass123!',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['message']);

        // Verify token deleted
        $this->assertDatabaseMissing('password_reset_tokens', [
            'email' => 'member@hudorian.com',
        ]);

        // Verify user can login with new password
        $user->refresh();
        $this->assertTrue(Hash::check('NewClearancePass123!', $user->password));
    }

    public function test_reset_password_fails_with_invalid_token(): void
    {
        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'member@hudorian.com',
            'token' => 'completely-invalid-token',
            'password' => 'NewClearancePass123!',
            'password_confirmation' => 'NewClearancePass123!',
        ]);

        $response->assertStatus(422);
    }
}
