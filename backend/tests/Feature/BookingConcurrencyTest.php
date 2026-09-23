<?php

namespace Tests\Feature;

use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingConcurrencyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_can_check_room_availability(): void
    {
        $room = Room::first();

        $response = $this->postJson('/api/v1/stays/check-availability', [
            'room_id' => $room->id,
            'check_in' => now()->addDays(40)->toDateString(),
            'check_out' => now()->addDays(45)->toDateString(),
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('available', true);
    }

    public function test_prevents_overlapping_room_reservations(): void
    {
        $user = User::where('email', 'member@hudorian.com')->first();
        $room = Room::first();

        $token = $user->createToken('member-token')->plainTextToken;

        $checkIn = now()->addDays(50)->toDateString();
        $checkOut = now()->addDays(55)->toDateString();

        // First booking should succeed
        $response1 = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/stays/book', [
                'room_id' => $room->id,
                'check_in' => $checkIn,
                'check_out' => $checkOut,
                'guests_count' => 2,
            ]);

        $response1->assertStatus(201)
            ->assertJsonPath('reservation.status', 'confirmed');

        // Overlapping second booking for the exact same dates must fail
        $response2 = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/stays/book', [
                'room_id' => $room->id,
                'check_in' => $checkIn,
                'check_out' => $checkOut,
                'guests_count' => 2,
            ]);

        $response2->assertStatus(422)
            ->assertJsonPath('error', 'Booking Failed');
    }
}

