<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MembershipPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'currency',
        'billing_period',
        'guest_allowance',
        'house_access_type',
        'stay_discount_percent',
        'perks',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'float',
        'stay_discount_percent' => 'float',
        'guest_allowance' => 'integer',
        'perks' => 'array',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function members(): HasMany
    {
        return $this->hasMany(Member::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(MembershipApplication::class);
    }
}

