<?php

namespace App\Services\Booking;

use App\Models\Event;
use App\Models\EventBooking;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use App\Services\Audit\AuditLogger;
use App\Services\Payments\PaymentGatewayInterface;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AvailabilityService
{
    protected PaymentGatewayInterface $paymentGateway;
    protected AuditLogger $auditLogger;

    public function __construct(PaymentGatewayInterface $paymentGateway, AuditLogger $auditLogger)
    {
        $this->paymentGateway = $paymentGateway;
        $this->auditLogger = $auditLogger;
    }

    /**
     * Check if a room is available for a specified date range.
     */
    public function isRoomAvailable(int $roomId, string $checkIn, string $checkOut): bool
    {
        $ci = Carbon::parse($checkIn)->toDateString();
        $co = Carbon::parse($checkOut)->toDateString();

        $overlapping = Reservation::where('room_id', $roomId)
            ->whereIn('status', ['confirmed', 'pending'])
            ->where(function ($query) use ($ci, $co) {
                $query->whereBetween('check_in', [$ci, $co])
                    ->orWhereBetween('check_out', [$ci, $co])
                    ->orWhere(function ($q) use ($ci, $co) {
                        $q->where('check_in', '<=', $ci)
                            ->where('check_out', '>=', $co);
                    });
            })
            ->where('check_in', '<', $co)
            ->where('check_out', '>', $ci)
            ->exists();

        return ! $overlapping;
    }

    /**
     * Book a room with transaction and row lock to prevent race conditions / double bookings.
     */
    public function bookRoom(
        User $user,
        int $roomId,
        string $checkIn,
        string $checkOut,
        int $guestsCount = 1,
        ?string $specialRequests = null
    ): Reservation {
        $ci = Carbon::parse($checkIn)->startOfDay();
        $co = Carbon::parse($checkOut)->startOfDay();

        if ($co->lte($ci)) {
            throw new Exception('Check-out date must be after check-in date.');
        }

        $nights = $ci->diffInDays($co);
        if ($nights < 1) {
            throw new Exception('Minimum stay duration is 1 night.');
        }

        return DB::transaction(function () use ($user, $roomId, $ci, $co, $nights, $guestsCount, $specialRequests) {
            // Lock the room record during booking
            $room = Room::where('id', $roomId)->lockForUpdate()->firstOrFail();

            if ($room->status !== 'active') {
                throw new Exception('Selected room is currently unavailable or under maintenance.');
            }

            if ($guestsCount > $room->capacity) {
                throw new Exception("Maximum capacity for {$room->name} is {$room->capacity} guests.");
            }

            $ciStr = $ci->toDateString();
            $coStr = $co->toDateString();

            // Re-verify availability within the atomic lock
            $hasOverlap = Reservation::where('room_id', $roomId)
                ->whereIn('status', ['confirmed', 'pending'])
                ->where('check_in', '<', $coStr)
                ->where('check_out', '>', $ciStr)
                ->lockForUpdate()
                ->exists();

            if ($hasOverlap) {
                throw new Exception('This room is no longer available for the requested dates.');
            }

            // Calculate price (apply member discount if active member)
            $nightRate = $room->base_price_per_night;
            $discountMultiplier = 1.0;

            if ($user->member && $user->member->isActive()) {
                $planDiscount = $user->member->plan->stay_discount_percent ?? 10.0;
                $discountMultiplier = (100 - $planDiscount) / 100.0;
            }

            $effectiveNightRate = round($nightRate * $discountMultiplier, 2);
            $totalAmount = round($effectiveNightRate * $nights, 2);

            $reservationNumber = 'RES-' . date('Y') . '-' . strtoupper(Str::random(6));

            $reservation = Reservation::create([
                'reservation_number' => $reservationNumber,
                'user_id' => $user->id,
                'room_id' => $room->id,
                'house_id' => $room->house_id,
                'check_in' => $ciStr,
                'check_out' => $coStr,
                'total_nights' => $nights,
                'guests_count' => $guestsCount,
                'night_rate' => $effectiveNightRate,
                'total_amount' => $totalAmount,
                'currency' => $room->currency,
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'special_requests' => $specialRequests,
            ]);

            // Charge through payment gateway abstraction
            $this->paymentGateway->charge(
                $user,
                $totalAmount,
                $room->currency,
                [
                    'payable_type' => Reservation::class,
                    'payable_id' => $reservation->id,
                    'reservation_number' => $reservationNumber,
                    'nights' => $nights,
                ],
                'idemp_res_' . $reservation->id
            );

            $this->auditLogger->log(
                $user,
                'reservation.created',
                'Reservation',
                $reservation->id,
                ['reservation_number' => $reservationNumber, 'room' => $room->name, 'total' => $totalAmount]
            );

            return $reservation;
        });
    }

    /**
     * Book tickets for a curated member event with capacity locking.
     */
    public function bookEvent(User $user, int $eventId, int $ticketsCount = 1): EventBooking
    {
        return DB::transaction(function () use ($user, $eventId, $ticketsCount) {
            $event = Event::where('id', $eventId)->lockForUpdate()->firstOrFail();

            if ($event->status !== 'published') {
                throw new Exception('This event is not open for reservations.');
            }

            if ($event->is_member_only && (! $user->member || ! $user->member->isActive())) {
                throw new Exception('This event is strictly reserved for active HUDORIAN members.');
            }

            if ($event->availableSeats() < $ticketsCount) {
                throw new Exception('Sorry, there are not enough remaining seats available for this event.');
            }

            $totalPrice = round($event->price * $ticketsCount, 2);
            $bookingRef = 'EVT-' . date('Y') . '-' . strtoupper(Str::random(6));

            $booking = EventBooking::create([
                'booking_reference' => $bookingRef,
                'event_id' => $event->id,
                'user_id' => $user->id,
                'tickets_count' => $ticketsCount,
                'total_price' => $totalPrice,
                'currency' => $event->currency,
                'status' => 'confirmed',
            ]);

            // Increment booked count atomically
            $event->increment('booked_count', $ticketsCount);

            if ($totalPrice > 0) {
                $this->paymentGateway->charge(
                    $user,
                    $totalPrice,
                    $event->currency,
                    [
                        'payable_type' => EventBooking::class,
                        'payable_id' => $booking->id,
                        'booking_reference' => $bookingRef,
                        'event_title' => $event->title,
                    ],
                    'idemp_evt_' . $booking->id
                );
            }

            $this->auditLogger->log(
                $user,
                'event.booked',
                'EventBooking',
                $booking->id,
                ['booking_reference' => $bookingRef, 'event' => $event->title, 'tickets' => $ticketsCount]
            );

            return $booking;
        });
    }
}

