<?php

namespace App\Models;

use App\Services\Library\LibrarySettingsService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Book extends Model
{
    use HasFactory;

    public const FORMATS = ['pdf', 'epub'];

    public const STATUSES = ['draft', 'published', 'archived'];

    protected $fillable = [
        'collection_id',
        'title',
        'slug',
        'author',
        'isbn',
        'format',
        'language',
        'published_year',
        'page_count',
        'short_description',
        'description',
        'cover_image',
        'file_url',
        'purchase_price',
        'rental_price',
        'currency',
        'rental_days',
        'allow_purchase',
        'allow_rental',
        'status',
        'is_featured',
        'sort_order',
    ];

    protected $casts = [
        'purchase_price' => 'float',
        'rental_price' => 'float',
        'rental_days' => 'integer',
        'page_count' => 'integer',
        'allow_purchase' => 'boolean',
        'allow_rental' => 'boolean',
        'is_featured' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * The protected source URL is never serialized by default. Public and
     * member-facing responses must not carry it; only the SecureGate
     * controller calls makeVisible() when an administrator needs to inspect
     * or edit the record.
     */
    protected $hidden = [
        'file_url',
    ];

    protected $appends = [
        'effective_rental_days',
    ];

    public function collection(): BelongsTo
    {
        // Laravel would otherwise infer book_collection_id from the model name.
        return $this->belongsTo(BookCollection::class, 'collection_id');
    }

    public function loans(): HasMany
    {
        return $this->hasMany(BookLoan::class);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (blank($term)) {
            return $query;
        }

        $like = '%'.trim($term).'%';

        return $query->where(function (Builder $q) use ($like) {
            $q->where('title', 'like', $like)
                ->orWhere('author', 'like', $like)
                ->orWhere('isbn', 'like', $like)
                ->orWhere('short_description', 'like', $like);
        });
    }

    /**
     * The number of days a rental of this title runs for, honouring the
     * per-book override and otherwise deferring to the admin default.
     */
    public function getEffectiveRentalDaysAttribute(): int
    {
        if ($this->rental_days && $this->rental_days > 0) {
            return $this->rental_days;
        }

        return app(LibrarySettingsService::class)->defaultRentalDays();
    }

    /**
     * Public payload for catalogue and detail responses.
     */
    public function toPublicArray(): array
    {
        $data = $this->toArray();

        // Belt and braces: the hidden attribute already strips this, but a
        // future makeVisible() elsewhere must never put it on a public route.
        unset($data['file_url']);

        return $data;
    }
}
