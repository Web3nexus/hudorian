<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Stay Reservations
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->string('reservation_number')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('room_id')->constrained()->cascadeOnDelete();
            $table->foreignId('house_id')->constrained()->cascadeOnDelete();
            $table->date('check_in');
            $table->date('check_out');
            $table->integer('total_nights');
            $table->integer('guests_count')->default(1);
            $table->decimal('night_rate', 10, 2);
            $table->decimal('total_amount', 10, 2);
            $table->string('currency', 3)->default('EUR');
            $table->string('status')->default('confirmed'); // pending, confirmed, cancelled, completed, no_show
            $table->string('payment_status')->default('paid'); // pending, paid, refunded, failed
            $table->text('special_requests')->nullable();
            $table->timestamps();

            // Index for fast overlap checks
            $table->index(['room_id', 'check_in', 'check_out', 'status']);
        });

        // Reservation Guests
        Schema::create('reservation_guests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('email')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
        });

        // Curated Member Events / Experiences
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('house_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('event_type')->default('dinner'); // dinner, culture, wellness, journey, private
            $table->text('short_description')->nullable();
            $table->longText('description');
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->string('location_detail')->nullable(); // e.g., "The Rooftop Terrace"
            $table->integer('capacity')->default(20);
            $table->integer('booked_count')->default(0);
            $table->decimal('price', 10, 2)->default(0.00);
            $table->string('currency', 3)->default('EUR');
            $table->boolean('is_member_only')->default(true);
            $table->string('hero_image')->nullable();
            $table->string('status')->default('published'); // published, draft, cancelled
            $table->timestamps();
        });

        // Event Bookings
        Schema::create('event_bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_reference')->unique();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->integer('tickets_count')->default(1);
            $table->decimal('total_price', 10, 2)->default(0.00);
            $table->string('currency', 3)->default('EUR');
            $table->string('status')->default('confirmed'); // confirmed, cancelled
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_bookings');
        Schema::dropIfExists('events');
        Schema::dropIfExists('reservation_guests');
        Schema::dropIfExists('reservations');
    }
};

