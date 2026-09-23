<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HouseMedia extends Model
{
    use HasFactory;

    protected $fillable = [
        'house_id',
        'media_url',
        'media_type',
        'caption',
        'sort_order',
    ];

    public function house(): BelongsTo
    {
        return $this->belongsTo(House::class);
    }
}

