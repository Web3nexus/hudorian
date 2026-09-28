<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookLoan extends Model
{
    use HasFactory;

    public const TYPES = ['purchase', 'rental'];

    public const STATUSES = ['active', 'expired', 'revoked'];

    protected $fillable = [
        'user_id',
        'book_id',
        'payment_id',
        'loan_type',
        'status',
        'granted_at',
        'expires_at',
        'download_count',
        'last_downloaded_at',
    ];

    protected $casts = [
        'granted_at' => 'datetime',
        'expires_at' => 'datetime',
        'last_downloaded_at' => 'datetime',
        'download_count' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    /**
     * A loan grants access while it is unrevoked and either perpetual
     * (a purchase) or not yet past its expiry.
     */
    public function grantsAccess(): bool
    {
        if ($this->status === 'revoked') {
            return false;
        }

        if ($this->status === 'expired') {
            return false;
        }

        if ($this->loan_type === 'purchase') {
            return true;
        }

        return $this->expires_at === null || $this->expires_at->isFuture();
    }

    /**
     * Whole days of reading time left, counting the expiry day in full.
     *
     * A 21-day rental must read as 21 rather than 20, so the calculation runs
     * on start-of-day boundaries instead of the raw instants.
     */
    public function daysRemaining(): int
    {
        if (! $this->expires_at || $this->loan_type === 'purchase') {
            return 0;
        }

        if ($this->expires_at->isPast()) {
            return 0;
        }

        return (int) now()->startOfDay()->diffInDays($this->expires_at->copy()->startOfDay());
    }
}
