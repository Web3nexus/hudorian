<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Membership Plans (Founder, Global House, Resident, etc.)
        Schema::create('membership_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description');
            $table->decimal('price', 10, 2);
            $table->string('currency', 3)->default('EUR');
            $table->string('billing_period')->default('annual'); // annual, monthly, lifetime
            $table->integer('guest_allowance')->default(2);
            $table->string('house_access_type')->default('all_houses'); // all_houses, regional, local_only
            $table->decimal('stay_discount_percent', 5, 2)->default(10.00);
            $table->json('perks')->nullable(); // JSON list of bullet points
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Members (tied to User)
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('membership_plan_id')->constrained()->cascadeOnDelete();
            $table->string('membership_number')->unique();
            $table->string('status')->default('active'); // active, suspended, cancelled, expired
            $table->string('card_verification_token')->nullable()->unique();
            $table->timestamp('card_token_expires_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->text('internal_notes')->nullable();
            $table->timestamps();
        });

        // Membership Applications (multi-step workflow)
        Schema::create('membership_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('membership_plan_id')->constrained()->cascadeOnDelete();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('city');
            $table->string('country');
            $table->string('profession');
            $table->string('company')->nullable();
            $table->text('bio');
            $table->string('social_profile_url')->nullable();
            $table->json('interests')->nullable();
            $table->string('status')->default('submitted'); // draft, submitted, under_review, approved, rejected, cancelled
            $table->foreignId('reviewer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('reviewer_notes')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_applications');
        Schema::dropIfExists('members');
        Schema::dropIfExists('membership_plans');
    }
};

