<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoomMedia extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_id',
        'media_url',
        'caption',
        'sort_order',
    ];

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }
}

