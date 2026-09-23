<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'country',
        'city',
        'avatar',
        'is_active',
        'google2fa_secret',
        'google2fa_enabled',
        'google2fa_confirmed_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'google2fa_secret',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'google2fa_enabled' => 'boolean',
            'google2fa_confirmed_at' => 'datetime',
        ];
    }

    public function member(): HasOne
    {
        return $this->hasOne(Member::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(MembershipApplication::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    public function eventBookings(): HasMany
    {
        return $this->hasMany(EventBooking::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, [
            'super_admin',
            'admin',
            'house_manager',
            'membership_manager',
            'finance_manager',
            'staff',
        ]);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isMember(): bool
    {
        return $this->role === 'member' || $this->member !== null;
    }
}
