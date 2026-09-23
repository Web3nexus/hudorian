<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class House extends Model
{
    use HasFactory;

    protected $fillable = [
        'location_id',
        'estate_id',
        'name',
        'slug',
        'tagline',
        'house_type',
        'short_description',
        'description',
        'address',
        'latitude',
        'longitude',
        'hero_image',
        'hero_video',
        'status',
        'is_featured',
        'sort_order',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'is_featured' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function estate(): BelongsTo
    {
        return $this->belongsTo(Estate::class);
    }

    public function amenities(): BelongsToMany
    {
        return $this->belongsToMany(Amenity::class, 'house_amenities');
    }

    public function media(): HasMany
    {
        return $this->hasMany(HouseMedia::class)->orderBy('sort_order');
    }

    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }
}

