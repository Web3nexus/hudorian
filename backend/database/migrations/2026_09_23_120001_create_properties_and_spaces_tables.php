<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('country');
            $table->string('region')->nullable();
            $table->string('timezone')->default('UTC');
            $table->timestamps();
        });

        Schema::create('estates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('location_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('tagline')->nullable();
            $table->text('description');
            $table->string('hero_image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('houses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('location_id')->constrained()->cascadeOnDelete();
            $table->foreignId('estate_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('tagline')->nullable();
            $table->string('house_type')->default('house'); // house, estate, club, retreat, villa, city_house
            $table->text('short_description')->nullable();
            $table->longText('description');
            $table->string('address');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('hero_image')->nullable();
            $table->string('hero_video')->nullable();
            $table->string('status')->default('active'); // active, coming_soon, members_only
            $table->boolean('is_featured')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('amenities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('icon')->nullable();
            $table->string('category')->default('general'); // wellness, dining, recreation, service
            $table->timestamps();
        });

        Schema::create('house_amenities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('house_id')->constrained()->cascadeOnDelete();
            $table->foreignId('amenity_id')->constrained()->cascadeOnDelete();
            $table->unique(['house_id', 'amenity_id']);
        });

        Schema::create('house_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('house_id')->constrained()->cascadeOnDelete();
            $table->string('media_url');
            $table->string('media_type')->default('image'); // image, video, floorplan, 360
            $table->string('caption')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('house_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('room_type')->default('suite'); // suite, room, villa, penthouse
            $table->text('description');
            $table->integer('capacity')->default(2);
            $table->integer('max_adults')->default(2);
            $table->integer('max_children')->default(1);
            $table->decimal('base_price_per_night', 10, 2);
            $table->string('currency', 3)->default('EUR');
            $table->integer('size_sqm')->nullable();
            $table->string('hero_image')->nullable();
            $table->string('status')->default('active'); // active, maintenance
            $table->timestamps();
        });

        Schema::create('room_amenities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained()->cascadeOnDelete();
            $table->foreignId('amenity_id')->constrained()->cascadeOnDelete();
            $table->unique(['room_id', 'amenity_id']);
        });

        Schema::create('room_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained()->cascadeOnDelete();
            $table->string('media_url');
            $table->string('caption')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_media');
        Schema::dropIfExists('room_amenities');
        Schema::dropIfExists('rooms');
        Schema::dropIfExists('house_media');
        Schema::dropIfExists('house_amenities');
        Schema::dropIfExists('amenities');
        Schema::dropIfExists('houses');
        Schema::dropIfExists('estates');
        Schema::dropIfExists('locations');
    }
};

