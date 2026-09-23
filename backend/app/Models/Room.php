<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'house_id',
        'name',
        'slug',
        'room_type',
        'description',
        'capacity',
        'max_adults',
        'max_children',
        'base_price_per_night',
        'currency',
        'size_sqm',
        'hero_image',
        'status',
    ];

    protected $casts = [
        'base_price_per_night' => 'decimal:2',
        'capacity' => 'integer',
        'max_adults' => 'integer',
        'max_children' => 'integer',
        'size_sqm' => 'integer',
    ];

    public function house(): BelongsTo
    {
        return $this->belongsTo(House::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(RoomMedia::class)->orderBy('sort_order');
    }

    public function amenities(): BelongsToMany
    {
        return $this->belongsToMany(Amenity::class, 'room_amenities');
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }
}

