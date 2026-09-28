<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('book_collections', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('cover_image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('books', function (Blueprint $table) {
            $table->id();
            // constrained() would derive the local column name from the table
            // argument, so the local column and the referenced key are both
            // stated explicitly.
            $table->foreignId('collection_id')
                ->nullable()
                ->references('id')
                ->on('book_collections')
                ->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('author');
            $table->string('isbn', 20)->nullable();
            $table->string('format')->default('pdf'); // pdf, epub
            $table->string('language', 8)->default('en');
            $table->string('published_year', 4)->nullable();
            $table->integer('page_count')->nullable();
            $table->text('short_description')->nullable();
            $table->longText('description');
            $table->string('cover_image')->nullable();
            $table->string('file_url')->nullable(); // Protected source; only ever exposed via a signed download link
            $table->decimal('purchase_price', 10, 2)->default(0.00);
            $table->decimal('rental_price', 10, 2)->default(0.00);
            $table->string('currency', 3)->default('EUR');
            $table->integer('rental_days')->nullable(); // null = fall back to the admin default
            $table->boolean('allow_purchase')->default(true);
            $table->boolean('allow_rental')->default(true);
            $table->string('status')->default('published'); // draft, published, archived
            $table->boolean('is_featured')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['status', 'is_featured']);
            $table->index('collection_id');
        });

        Schema::create('book_loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('book_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payment_id')
                ->nullable()
                ->references('id')
                ->on('payments')
                ->nullOnDelete();
            $table->string('loan_type'); // purchase, rental
            $table->string('status')->default('active'); // active, expired, revoked
            $table->timestamp('granted_at');
            $table->timestamp('expires_at')->nullable(); // null = perpetual (purchase)
            $table->unsignedInteger('download_count')->default(0);
            $table->timestamp('last_downloaded_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']); // Index for "my archive" lookups
            $table->index(['book_id', 'status']); // Index for admin loan ledgers
            $table->index('expires_at'); // Index for expiry sweeps
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('book_loans');
        Schema::dropIfExists('books');
        Schema::dropIfExists('book_collections');
    }
};
