<?php

namespace App\Services\Library;

use App\Models\Book;
use App\Models\BookLoan;
use App\Models\Payment;
use App\Models\User;
use App\Services\Audit\AuditLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookCheckoutService
{
    public const MODE_PURCHASE = 'purchase';

    public const MODE_RENTAL = 'rental';

    public function __construct(
        protected AuditLogger $auditLogger,
        protected LibrarySettingsService $settings
    ) {}

    /**
     * The mode a given user should be quoted for, given any live grant.
     * A perpetual purchase means no further payment is ever required.
     */
    public function availableModes(Book $book, ?User $user = null): array
    {
        if (! $user) {
            return $this->offeredModes($book);
        }

        $loan = $this->activeLoan($user, $book);
        if ($loan && $loan->loan_type === self::MODE_PURCHASE) {
            return [];
        }

        return $this->offeredModes($book);
    }

    protected function offeredModes(Book $book): array
    {
        $modes = [];

        if ($this->settings->getSettings()['purchase_enabled'] ?? true) {
            if ($book->allow_purchase) {
                $modes[] = self::MODE_PURCHASE;
            }
        }

        if ($this->settings->getSettings()['rental_enabled'] ?? true) {
            if ($book->allow_rental) {
                $modes[] = self::MODE_RENTAL;
            }
        }

        return $modes;
    }

    /**
     * Create a pending payment row for a book purchase or rental.
     */
    public function recordPayment(
        User $user,
        Book $book,
        string $mode,
        string $provider,
        string $status,
        string $transactionId,
        float $amount,
        string $currency,
        array $metadata = []
    ): Payment {
        $rentalDays = $mode === self::MODE_RENTAL ? $book->effective_rental_days : null;

        return Payment::create([
            'transaction_id' => $transactionId,
            'user_id' => $user->id,
            'payable_type' => Book::class,
            'payable_id' => $book->id,
            'amount' => $amount,
            'currency' => $currency,
            'provider' => $provider,
            'status' => $status,
            'payment_method' => $provider === 'manual_transfer' ? 'bank_transfer' : 'card',
            'metadata' => array_merge([
                'book_id' => $book->id,
                'book_title' => $book->title,
                'book_slug' => $book->slug,
                'acquisition_mode' => $mode,
                'rental_days' => $rentalDays,
                'base_price' => $mode === self::MODE_RENTAL ? $book->rental_price : $book->purchase_price,
                'base_currency' => strtoupper($book->currency ?: 'EUR'),
                'description' => 'HUDORIAN Royal Archive — '.$book->title.' ('.($mode === self::MODE_RENTAL ? 'Rental' : 'Purchase').')',
                'user_email' => $user->email,
                'user_name' => $user->name,
            ], $metadata),
        ]);
    }

    /**
     * Turn a settled payment into an archive loan. Safe to call repeatedly:
     * a payment that already produced a loan resolves to that same loan.
     */
    public function fulfilFromPayment(Payment $payment, array $verificationData = []): ?BookLoan
    {
        return DB::transaction(function () use ($payment, $verificationData) {
            // A payment records the loan it produced, so a replayed webhook
            // resolves to the same grant even after a later renewal has moved
            // the loan's payment_id forward.
            $recorded = isset($payment->metadata['loan_id'])
                ? BookLoan::find($payment->metadata['loan_id'])
                : null;

            $existing = $recorded ?? BookLoan::where('payment_id', $payment->id)->first();
            if ($existing) {
                return $existing;
            }

            $book = $payment->payable_type === Book::class
                ? Book::find($payment->payable_id)
                : Book::find($payment->metadata['book_id'] ?? null);

            if (! $book || ! $payment->user) {
                return null;
            }

            $mode = $verificationData['mode']
                ?? ($payment->metadata['acquisition_mode'] ?? self::MODE_PURCHASE);

            if (! in_array($mode, [self::MODE_PURCHASE, self::MODE_RENTAL], true)) {
                $mode = self::MODE_PURCHASE;
            }

            $loan = $this->grantAccess(
                $book,
                $payment->user,
                $mode,
                $payment->metadata['rental_days'] ?? null,
                $payment
            );

            $this->linkPaymentToLoan($payment, $loan);

            $this->auditLogger->log(
                $payment->user,
                'book.loan_granted',
                'Book',
                $book->id,
                [
                    'mode' => $mode,
                    'loan_id' => $loan->id,
                    'title' => $book->title,
                    'expires_at' => $loan->expires_at?->toIso8601String(),
                    'transaction_id' => $payment->transaction_id,
                ]
            );

            return $loan;
        });
    }

    /**
     * Create or extend the access grant for a user and book.
     *
     * A purchase is perpetual and supersedes any rental. A rental run while a
     * perpetual grant already exists is a no-op, since access is already
     * unlimited; otherwise an active rental is extended from its own expiry so
     * repeated renewals never lose days.
     */
    public function grantAccess(
        Book $book,
        User $user,
        string $mode,
        ?int $rentalDays = null,
        ?Payment $payment = null
    ): BookLoan {
        $existing = $this->activeLoan($user, $book);

        if ($mode === self::MODE_PURCHASE) {
            $this->retireOutstandingRentals($user, $book);

            if ($existing && $existing->loan_type === self::MODE_PURCHASE) {
                return $existing;
            }

            return BookLoan::create([
                'user_id' => $user->id,
                'book_id' => $book->id,
                'payment_id' => $payment?->id,
                'loan_type' => self::MODE_PURCHASE,
                'status' => 'active',
                'granted_at' => now(),
                'expires_at' => null,
            ]);
        }

        // Rental
        if ($existing && $existing->loan_type === self::MODE_PURCHASE) {
            return $existing;
        }

        $days = $rentalDays ?: ($book->rental_days ?: $this->settings->defaultRentalDays());
        $days = max(1, (int) $days);

        // A lapsed rental is revived rather than duplicated, so the reader's
        // shelf keeps one row per title. A revoked loan is never revived
        // implicitly; that requires a fresh steward grant.
        $revivable = $existing ?: $this->revivableRental($user, $book);

        if ($revivable) {
            $base = ($revivable->expires_at && $revivable->expires_at->isFuture())
                ? $revivable->expires_at
                : now();

            $revivable->update([
                'status' => 'active',
                'granted_at' => now(),
                'expires_at' => $base->copy()->addDays($days),
            ]);

            return $revivable->fresh();
        }

        return BookLoan::create([
            'user_id' => $user->id,
            'book_id' => $book->id,
            'payment_id' => $payment?->id,
            'loan_type' => self::MODE_RENTAL,
            'status' => 'active',
            'granted_at' => now(),
            'expires_at' => now()->addDays($days),
        ]);
    }

    /**
     * Point a payment at the loan it produced so a replayed webhook or a
     * verification retry resolves to the same grant.
     */
    protected function linkPaymentToLoan(Payment $payment, BookLoan $loan): void
    {
        if (! $payment || ($payment->metadata['loan_id'] ?? null) == $loan->id) {
            return;
        }

        $payment->update([
            'metadata' => array_merge($payment->metadata ?? [], ['loan_id' => $loan->id]),
        ]);
    }

    /**
     * The user's highest-privilege live loan for a title, if any.
     */
    public function activeLoan(User $user, Book $book): ?BookLoan
    {
        $loans = BookLoan::where('user_id', $user->id)
            ->where('book_id', $book->id)
            ->where('status', 'active')
            ->orderByRaw("CASE WHEN loan_type = 'purchase' THEN 0 ELSE 1 END")
            ->orderByDesc('expires_at')
            ->get();

        return $loans->first(fn (BookLoan $loan) => $loan->grantsAccess());
    }

    /**
     * The reader's most recent lapsed rental for a title, if one may be revived.
     */
    protected function revivableRental(User $user, Book $book): ?BookLoan
    {
        return BookLoan::where('user_id', $user->id)
            ->where('book_id', $book->id)
            ->where('loan_type', self::MODE_RENTAL)
            ->where('status', 'expired')
            ->latest('granted_at')
            ->first();
    }

    /**
     * Mark every live rental for a title as expired.
     */
    public function expireRentals(Book $book): int
    {
        return BookLoan::where('book_id', $book->id)
            ->where('loan_type', self::MODE_RENTAL)
            ->where('status', 'active')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->update(['status' => 'expired']);
    }

    protected function retireOutstandingRentals(User $user, Book $book): void
    {
        BookLoan::where('user_id', $user->id)
            ->where('book_id', $book->id)
            ->where('loan_type', self::MODE_RENTAL)
            ->where('status', 'active')
            ->update(['status' => 'expired']);
    }

    /**
     * Record a download against a loan and return the protected source URL.
     */
    public function recordDownload(BookLoan $loan): ?string
    {
        $loan->increment('download_count');
        $loan->forceFill(['last_downloaded_at' => now()])->save();

        return $loan->book?->file_url;
    }

    public function generateTransactionId(string $provider, int $userId): string
    {
        $prefix = match ($provider) {
            'flutterwave' => 'flw_bk',
            'paystack' => 'pstk_bk',
            'manual' => 'wire',
            default => 'bk',
        };

        return $prefix.'_'.$userId.'_'.time().'_'.Str::lower(Str::random(6));
    }
}
