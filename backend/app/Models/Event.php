<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'house_id',
        'title',
        'slug',
        'event_type',
        'short_description',
        'description',
        'starts_at',
        'ends_at',
        'location_detail',
        'capacity',
        'booked_count',
        'price',
        'currency',
        'is_member_only',
        'hero_image',
        'status',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'capacity' => 'integer',
        'booked_count' => 'integer',
        'price' => 'float',
        'is_member_only' => 'boolean',
    ];

    public function house(): BelongsTo
    {
        return $this->belongsTo(House::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(EventBooking::class);
    }

    public function availableSeats(): int
    {
        return max(0, $this->capacity - $this->booked_count);
    }
}

