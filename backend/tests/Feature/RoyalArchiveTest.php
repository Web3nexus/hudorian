<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\BookCollection;
use App\Models\BookLoan;
use App\Models\Member;
use App\Models\MembershipPlan;
use App\Models\Payment;
use App\Models\User;
use App\Services\Library\BookCheckoutService;
use App\Services\Library\LibrarySettingsService;
use App\Services\Payments\MembershipPaymentService;
use App\Services\Payments\PaystackService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class RoyalArchiveTest extends TestCase
{
    use RefreshDatabase;

    protected function book(array $overrides = []): Book
    {
        $collection = BookCollection::create([
            'name' => 'The Sovereign Collection',
            'slug' => 'sovereign-'.uniqid(),
        ]);

        return Book::create(array_merge([
            'collection_id' => $collection->id,
            'title' => 'The Discipline of Sovereignty',
            'slug' => 'discipline-'.uniqid(),
            'author' => 'Aldous Verity',
            'format' => 'pdf',
            'description' => 'A manual on the art of command.',
            'file_url' => 'https://cdn.example.com/secure/discipline.pdf',
            'purchase_price' => 145.00,
            'rental_price' => 18.00,
            'currency' => 'EUR',
            'rental_days' => 21,
            'allow_purchase' => true,
            'allow_rental' => true,
            'status' => 'published',
        ], $overrides));
    }

    protected function member(): User
    {
        return User::factory()->create(['role' => 'member']);
    }

    /**
     * A real bearer token, as a browser holds it. Deliberately not actingAs():
     * checkout and settlement sit outside auth:sanctum, so a test that binds a
     * session would pass even when bearer clients are rejected in production.
     */
    protected function bearerFor(User $user): string
    {
        return $user->createToken('archive-test')->plainTextToken;
    }

    protected function admin(): User
    {
        // The factory does not set is_active, and SecureGate requires it.
        return User::factory()->create([
            'role' => 'super_admin',
            'is_active' => true,
        ]);
    }

    // -----------------------------------------------------------------
    // Catalogue
    // -----------------------------------------------------------------

    public function test_public_catalogue_lists_published_titles(): void
    {
        $this->book(['title' => 'Published Volume']);
        $this->book(['title' => 'Draft Volume', 'status' => 'draft']);

        $response = $this->getJson('/api/v1/library/books');

        $response->assertOk();
        $titles = collect($response->json('data'))->pluck('title');
        $this->assertTrue($titles->contains('Published Volume'));
        $this->assertFalse($titles->contains('Draft Volume'));
    }

    public function test_catalogue_never_exposes_the_protected_file_url(): void
    {
        $this->book();

        $response = $this->getJson('/api/v1/library/books');

        $response->assertOk();
        $response->assertJsonMissingPath('data.0.file_url');
        $this->assertStringNotContainsString('cdn.example.com', $response->getContent());
    }

    public function test_catalogue_can_filter_by_collection(): void
    {
        $sentinel = $this->book(['title' => 'Sentinel Volume']);
        $this->book(['title' => 'Other Volume']);

        $response = $this->getJson('/api/v1/library/books?collection='.$sentinel->collection->slug);

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertSame('Sentinel Volume', $response->json('data.0.title'));
    }

    public function test_detail_resolves_loan_state_for_the_holder(): void
    {
        $book = $this->book();
        $user = $this->member();

        app(BookCheckoutService::class)->grantAccess($book, $user, 'purchase');

        $response = $this->actingAs($user)->getJson('/api/v1/library/books/'.$book->slug);

        $response->assertOk();
        $this->assertSame('purchase', $response->json('data.access.loan_type'));
        $response->assertJsonMissingPath('data.file_url');
    }

    // -----------------------------------------------------------------
    // Entitlement rules
    // -----------------------------------------------------------------

    public function test_rental_grants_time_limited_access(): void
    {
        $book = $this->book();
        $user = $this->member();

        $loan = app(BookCheckoutService::class)->grantAccess($book, $user, 'rental');

        $this->assertSame('rental', $loan->loan_type);
        $this->assertTrue($loan->grantsAccess());
        $this->assertTrue($loan->expires_at->isFuture());
        $this->assertSame(21, $loan->daysRemaining());
    }

    public function test_rental_respects_the_admin_default_when_the_book_has_no_override(): void
    {
        app(LibrarySettingsService::class)->updateSettings(['default_rental_days' => 9]);

        $book = $this->book(['rental_days' => null]);
        $loan = app(BookCheckoutService::class)->grantAccess($book, $this->member(), 'rental');

        $this->assertSame(9, $loan->daysRemaining());
    }

    public function test_expired_rental_stops_granting_access(): void
    {
        $book = $this->book();
        $loan = app(BookCheckoutService::class)->grantAccess($book, $this->member(), 'rental');

        $loan->update(['expires_at' => now()->subDay()]);

        $this->assertFalse($loan->fresh()->grantsAccess());
        $this->assertSame(0, $loan->fresh()->daysRemaining());
    }

    public function test_purchase_supersedes_an_active_rental(): void
    {
        $book = $this->book();
        $user = $this->member();
        $service = app(BookCheckoutService::class);

        $service->grantAccess($book, $user, 'rental');
        $purchase = $service->grantAccess($book, $user, 'purchase');

        $this->assertSame('purchase', $purchase->loan_type);
        $this->assertNull($purchase->expires_at);
        $this->assertTrue($purchase->grantsAccess());

        // The rental must no longer be the live grant.
        $this->assertSame('purchase', $service->activeLoan($user, $book)->loan_type);
    }

    public function test_rental_after_purchase_is_a_no_op(): void
    {
        $book = $this->book();
        $user = $this->member();
        $service = app(BookCheckoutService::class);

        $service->grantAccess($book, $user, 'purchase');
        $result = $service->grantAccess($book, $user, 'rental');

        $this->assertSame('purchase', $result->loan_type);
        $this->assertSame(1, BookLoan::where('user_id', $user->id)->count());
    }

    public function test_renewing_an_active_rental_extends_from_its_own_expiry(): void
    {
        $book = $this->book();
        $user = $this->member();
        $service = app(BookCheckoutService::class);

        $first = $service->grantAccess($book, $user, 'rental');
        $originalExpiry = $first->expires_at->copy();

        $second = $service->grantAccess($book, $user, 'rental');

        // Extended, not reset — no days are lost.
        $this->assertTrue($second->expires_at->greaterThan($originalExpiry));
        $this->assertSame(1, BookLoan::where('user_id', $user->id)->count());
    }

    public function test_a_reader_cannot_rent_the_same_title_for_two_books(): void
    {
        $bookA = $this->book();
        $bookB = $this->book(['title' => 'Another Volume']);
        $user = $this->member();

        app(BookCheckoutService::class)->grantAccess($bookA, $user, 'rental');
        app(BookCheckoutService::class)->grantAccess($bookB, $user, 'rental');

        $this->assertSame(2, BookLoan::where('user_id', $user->id)->count());
    }

    // -----------------------------------------------------------------
    // Fulfillment must not leak into membership activation
    // -----------------------------------------------------------------

    public function test_a_book_payment_issues_a_loan_and_no_membership(): void
    {
        $book = $this->book();
        $user = $this->member();

        $payment = Payment::create([
            'transaction_id' => 'flw_bk_'.uniqid(),
            'user_id' => $user->id,
            'payable_type' => Book::class,
            'payable_id' => $book->id,
            'amount' => 145.00,
            'currency' => 'EUR',
            'provider' => 'flutterwave',
            'status' => 'paid',
            'metadata' => ['acquisition_mode' => 'purchase'],
        ]);

        app(MembershipPaymentService::class)->fulfil($payment);

        $this->assertDatabaseHas('book_loans', [
            'user_id' => $user->id,
            'book_id' => $book->id,
            'loan_type' => 'purchase',
        ]);

        // The critical assertion: a book purchase must never create a Member.
        $this->assertDatabaseMissing('members', ['user_id' => $user->id]);
    }

    public function test_a_membership_payment_still_activates_membership(): void
    {
        $user = $this->member();
        $plan = MembershipPlan::create([
            'name' => 'Global House Member',
            'slug' => 'global-'.uniqid(),
            'description' => 'A tier used only to assert membership fulfilment is unaffected.',
            'price' => 100.00,
            'currency' => 'EUR',
        ]);

        $payment = Payment::create([
            'transaction_id' => 'flw_mbr_'.uniqid(),
            'user_id' => $user->id,
            'payable_type' => MembershipPlan::class,
            'payable_id' => $plan->id,
            'amount' => 100.00,
            'currency' => 'EUR',
            'provider' => 'flutterwave',
            'status' => 'paid',
        ]);

        app(MembershipPaymentService::class)->fulfil($payment);

        $this->assertDatabaseHas('members', ['user_id' => $user->id]);
        $this->assertDatabaseMissing('book_loans', ['user_id' => $user->id]);
    }

    public function test_fulfilment_is_idempotent_for_a_repeated_webhook(): void
    {
        $book = $this->book();
        $user = $this->member();
        $service = app(BookCheckoutService::class);

        $payment = $service->recordPayment(
            $user, $book, 'rental', 'flutterwave', 'paid',
            'flw_bk_dup_'.uniqid(), 18.00, 'EUR'
        );

        $service->fulfilFromPayment($payment);
        $service->fulfilFromPayment($payment);
        $service->fulfilFromPayment($payment);

        $this->assertSame(1, BookLoan::where('payment_id', $payment->id)->count());
    }

    // -----------------------------------------------------------------
    // Download delivery
    // -----------------------------------------------------------------

    public function test_download_link_is_issued_to_the_holder_only(): void
    {
        $book = $this->book();
        $user = $this->member();
        $loan = app(BookCheckoutService::class)->grantAccess($book, $user, 'purchase');

        $response = $this->actingAs($user)
            ->postJson("/api/v1/library/loans/{$loan->id}/download");

        $response->assertOk();
        $this->assertNotEmpty($response->json('data.download_url'));

        // Issuing a link is not a download; only redeeming it counts.
        $this->assertSame(0, $loan->fresh()->download_count);
    }

    public function test_another_reader_cannot_request_someone_elses_download(): void
    {
        $book = $this->book();
        $owner = $this->member();
        $intruder = $this->member();
        $loan = app(BookCheckoutService::class)->grantAccess($book, $owner, 'purchase');

        $this->actingAs($intruder)
            ->postJson("/api/v1/library/loans/{$loan->id}/download")
            ->assertNotFound();
    }

    public function test_anonymous_visitors_cannot_reach_the_archive(): void
    {
        $this->getJson('/api/v1/library/my-archive')->assertUnauthorized();
    }

    public function test_download_requires_a_signature(): void
    {
        $book = $this->book();
        $user = $this->member();
        $loan = app(BookCheckoutService::class)->grantAccess($book, $user, 'purchase');

        $this->actingAs($user)
            ->getJson("/api/v1/library/download/{$loan->id}")
            ->assertForbidden();
    }

    public function test_an_unreachable_source_is_not_counted_as_a_download(): void
    {
        // cdn.example.com does not resolve, so delivery fails. The reader must be
        // told so, and the ledger must not claim they took the volume.
        $book = $this->book();
        $user = $this->member();
        $loan = app(BookCheckoutService::class)->grantAccess($book, $user, 'purchase');

        $signed = URL::temporarySignedRoute('api.v1.library.download.serve', now()->addMinutes(5), ['loan' => $loan->id]);

        $this->actingAs($user)->getJson($signed)->assertStatus(502);
        $this->assertSame(0, $loan->fresh()->download_count);
    }

    public function test_a_revoked_loan_cannot_be_renewed_into_silence(): void
    {
        $book = $this->book();
        $user = $this->member();
        $loan = app(BookCheckoutService::class)->grantAccess($book, $user, 'rental');
        $loan->update(['status' => 'revoked']);

        $this->actingAs($user)
            ->postJson("/api/v1/library/loans/{$loan->id}/download")
            ->assertNotFound();
    }

    public function test_my_archive_reports_a_summary(): void
    {
        $user = $this->member();
        $service = app(BookCheckoutService::class);

        $service->grantAccess($this->book(), $user, 'purchase');
        $service->grantAccess($this->book(['title' => 'Second Volume']), $user, 'rental');

        $response = $this->actingAs($user)->getJson('/api/v1/library/my-archive');

        $response->assertOk();
        $this->assertSame(1, $response->json('data.summary.owned'));
        $this->assertSame(1, $response->json('data.summary.active_rentals'));
        $this->assertCount(2, $response->json('data.shelf'));
    }

    public function test_renewal_never_grants_access_without_payment(): void
    {
        $book = $this->book();
        $user = $this->member();
        $loan = app(BookCheckoutService::class)->grantAccess($book, $user, 'rental');
        $loan->update(['expires_at' => now()->subDay(), 'status' => 'expired']);

        $response = $this->actingAs($user)
            ->postJson("/api/v1/library/loans/{$loan->id}/renew");

        $response->assertOk();

        // The endpoint only points the reader at the paid checkout.
        $response->assertJsonPath('data.mode', 'rental');
        $response->assertJsonPath('data.book_id', $book->id);
        $this->assertFalse($loan->fresh()->grantsAccess());
    }

    public function test_a_lapsed_rental_is_revived_once_its_renewal_payment_settles(): void
    {
        $book = $this->book();
        $user = $this->member();
        $service = app(BookCheckoutService::class);

        $loan = $service->grantAccess($book, $user, 'rental');
        $loan->update(['expires_at' => now()->subDay(), 'status' => 'expired']);

        $payment = $service->recordPayment(
            $user, $book, 'rental', 'paystack', 'paid',
            'pstk_renew_'.uniqid(), 15.00, 'EUR'
        );

        $service->fulfilFromPayment($payment);

        $this->assertTrue($loan->fresh()->grantsAccess());
        $this->assertSame(1, BookLoan::where('user_id', $user->id)->count());
    }

    public function test_a_revoked_loan_cannot_be_renewed(): void
    {
        $book = $this->book();
        $user = $this->member();
        $loan = app(BookCheckoutService::class)->grantAccess($book, $user, 'rental');
        $loan->update(['status' => 'revoked']);

        $this->actingAs($user)
            ->postJson("/api/v1/library/loans/{$loan->id}/renew")
            ->assertStatus(403);
    }

    public function test_a_purchased_title_cannot_be_renewed(): void
    {
        $book = $this->book();
        $user = $this->member();
        $loan = app(BookCheckoutService::class)->grantAccess($book, $user, 'purchase');

        $this->actingAs($user)
            ->postJson("/api/v1/library/loans/{$loan->id}/renew")
            ->assertStatus(422);
    }

    // -----------------------------------------------------------------
    // Admin surface
    // -----------------------------------------------------------------

    public function test_admin_can_create_a_title(): void
    {
        $response = $this->actingAs($this->admin())->postJson('/api/v1/admin/archive/books', [
            'title' => 'A New Volume',
            'author' => 'A. Writer',
            'format' => 'epub',
            'description' => 'A description.',
            'purchase_price' => 50,
            'rental_price' => 10,
            'status' => 'published',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('books', ['title' => 'A New Volume']);
    }

    public function test_admin_sees_the_file_url_that_the_public_never_does(): void
    {
        $book = $this->book();

        $response = $this->actingAs($this->admin())
            ->getJson('/api/v1/admin/archive/books?search='.$book->title);

        $response->assertOk();
        $this->assertSame($book->file_url, $response->json('data.0.file_url'));
    }

    public function test_admin_can_read_a_single_title_for_the_editor(): void
    {
        $book = $this->book();

        $response = $this->actingAs($this->admin())
            ->getJson("/api/v1/admin/archive/books/{$book->id}");

        $response->assertOk();
        $this->assertSame($book->title, $response->json('data.title'));
        $this->assertSame($book->file_url, $response->json('data.file_url'));
    }

    public function test_a_single_title_is_not_reachable_without_steward_clearance(): void
    {
        $book = $this->book();

        $this->actingAs($this->member())
            ->getJson("/api/v1/admin/archive/books/{$book->id}")
            ->assertForbidden();
    }

    public function test_slugs_are_de_duplicated_on_create(): void
    {
        $admin = $this->admin();

        foreach (['Same Title', 'Same Title'] as $title) {
            $this->actingAs($admin)->postJson('/api/v1/admin/archive/books', [
                'title' => $title,
                'author' => 'A. Writer',
                'format' => 'pdf',
                'description' => 'A description.',
                'purchase_price' => 50,
                'status' => 'published',
            ])->assertCreated();
        }

        $slugs = Book::orderBy('id')->pluck('slug')->all();
        $this->assertSame($slugs, array_unique($slugs));
        $this->assertCount(2, array_unique($slugs));
    }

    public function test_deleting_a_title_with_loans_is_refused(): void
    {
        $book = $this->book();
        app(BookCheckoutService::class)->grantAccess($book, $this->member(), 'purchase');

        $this->actingAs($this->admin())
            ->deleteJson("/api/v1/admin/archive/books/{$book->id}")
            ->assertStatus(409);

        $this->assertDatabaseHas('books', ['id' => $book->id]);
    }

    public function test_admin_can_grant_and_revoke_access(): void
    {
        $book = $this->book();
        $reader = $this->member();
        $admin = $this->admin();

        $grant = $this->actingAs($admin)->postJson('/api/v1/admin/archive/loans/grant', [
            'book_id' => $book->id,
            'user_id' => $reader->id,
            'loan_type' => 'rental',
            'rental_days' => 30,
        ]);

        $grant->assertCreated();
        $loanId = $grant->json('data.id');
        $this->assertSame(30, BookLoan::find($loanId)->daysRemaining());

        $this->actingAs($admin)
            ->postJson("/api/v1/admin/archive/loans/{$loanId}/revoke")
            ->assertOk();

        $this->assertSame('revoked', BookLoan::find($loanId)->status);
    }

    public function test_admin_can_update_the_default_rental_term(): void
    {
        $this->actingAs($this->admin())->putJson('/api/v1/admin/archive/settings', [
            'purchase_enabled' => true,
            'rental_enabled' => true,
            'default_rental_days' => 45,
            'max_rental_days' => 60,
            'rental_terms' => 'Rental terms.',
            'purchase_terms' => 'Purchase terms.',
        ])->assertOk();

        $this->assertSame(45, app(LibrarySettingsService::class)->defaultRentalDays());
    }

    public function test_the_archive_is_closed_to_non_admins(): void
    {
        $this->actingAs($this->member())
            ->getJson('/api/v1/admin/archive/books')
            ->assertForbidden();

        $this->app['auth']->forgetGuards();

        $this->getJson('/api/v1/admin/archive/books')
            ->assertStatus(401);
    }

    public function test_a_purchaseless_title_is_not_offered_for_purchase(): void
    {
        $book = $this->book(['purchase_price' => 0, 'rental_price' => 12]);

        $this->actingAs($this->admin())->putJson("/api/v1/admin/archive/books/{$book->id}", [
            'purchase_price' => 0,
        ])->assertOk();

        $this->assertFalse($book->fresh()->allow_purchase);
    }

    // -----------------------------------------------------------------
    // Checkout boundaries
    // -----------------------------------------------------------------

    public function test_a_guest_checkout_requires_an_email_to_open_the_archive(): void
    {
        $book = $this->book();

        $this->postJson('/api/v1/library/checkout', [
            'book_id' => $book->id,
            'mode' => 'rental',
            'gateway' => 'manual',
        ])->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_a_guest_manual_transfer_opens_an_archive_and_returns_a_token(): void
    {
        $book = $this->book();

        $response = $this->postJson('/api/v1/library/checkout', [
            'book_id' => $book->id,
            'mode' => 'rental',
            'gateway' => 'manual',
            'email' => 'guest-'.uniqid().'@example.com',
            'name' => 'A Guest Reader',
        ]);

        $response->assertCreated();
        $response->assertJsonPath('gateway', 'manual');
        $this->assertNotEmpty($response->json('token'));

        // The payment awaits Treasury clearance, so nothing is granted yet.
        $this->assertSame(0, BookLoan::where('book_id', $book->id)->count());
        $this->assertDatabaseHas('payments', [
            'payable_type' => Book::class,
            'payable_id' => $book->id,
            'status' => 'pending',
        ]);
    }

    public function test_a_card_checkout_records_a_pending_payment_before_any_charge(): void
    {
        $book = $this->book();
        $user = $this->member();

        $this->mock(PaystackService::class, function ($mock) {
            $mock->shouldReceive('initializePayment')->once()->andReturn([
                'success' => true,
                'authorization_url' => 'https://checkout.paystack.test/abc',
                'access_code' => 'abc',
            ]);
        });

        $response = $this->actingAs($user)->postJson('/api/v1/library/checkout', [
            'book_id' => $book->id,
            'mode' => 'purchase',
            'gateway' => 'paystack',
        ]);

        $response->assertOk();
        $response->assertJsonPath('success', true);
        $this->assertSame('https://checkout.paystack.test/abc', $response->json('authorization_url'));
        $this->assertDatabaseHas('payments', [
            'user_id' => $user->id,
            'payable_id' => $book->id,
            'status' => 'pending',
        ]);
    }

    public function test_a_perpetual_holder_is_never_charged_twice(): void
    {
        $book = $this->book();
        $user = $this->member();
        app(BookCheckoutService::class)->grantAccess($book, $user, 'purchase');

        $this->actingAs($user)->postJson('/api/v1/library/checkout', [
            'book_id' => $book->id,
            'mode' => 'purchase',
            'gateway' => 'manual',
        ])->assertStatus(409);
    }

    public function test_a_guest_cannot_verify_another_readers_payment(): void
    {
        $book = $this->book();
        $owner = $this->member();

        $payment = app(BookCheckoutService::class)->recordPayment(
            $owner, $book, 'rental', 'paystack', 'pending',
            'pstk_others_'.uniqid(), 18.00, 'EUR'
        );

        $this->actingAs($this->member())
            ->postJson('/api/v1/library/verify', [
                'gateway' => 'paystack',
                'reference' => $payment->transaction_id,
            ])
            ->assertStatus(403);

        $this->assertSame('pending', $payment->fresh()->status);
        $this->assertDatabaseMissing('book_loans', ['book_id' => $book->id]);
    }

    public function test_a_settled_payment_is_not_revealed_to_another_reader(): void
    {
        $book = $this->book();
        $owner = $this->member();
        $intruder = $this->member();

        $payment = app(BookCheckoutService::class)->recordPayment(
            $owner, $book, 'purchase', 'paystack', 'paid',
            'pstk_settled_'.uniqid(), 145.00, 'EUR'
        );
        app(MembershipPaymentService::class)->fulfil($payment);

        $this->actingAs($intruder)
            ->postJson('/api/v1/library/verify', [
                'gateway' => 'paystack',
                'reference' => $payment->transaction_id,
            ])
            ->assertStatus(403)
            ->assertJsonMissing(['loan_id' => BookLoan::where('payment_id', $payment->id)->value('id')]);
    }

    public function test_an_anonymous_visitor_cannot_read_a_settled_payment(): void
    {
        $book = $this->book();
        $owner = $this->member();

        $payment = app(BookCheckoutService::class)->recordPayment(
            $owner, $book, 'purchase', 'paystack', 'paid',
            'pstk_open_'.uniqid(), 145.00, 'EUR'
        );

        $this->postJson('/api/v1/library/verify', [
            'gateway' => 'paystack',
            'reference' => $payment->transaction_id,
        ])->assertStatus(403);
    }

    public function test_the_paying_reader_settles_with_a_bearer_token(): void
    {
        // Checkout and settlement live outside auth:sanctum, so a real token has
        // to be honoured or the gateway return would always be refused.
        $book = $this->book();
        $owner = $this->member();

        $payment = app(BookCheckoutService::class)->recordPayment(
            $owner, $book, 'purchase', 'paystack', 'pending',
            'pstk_token_'.uniqid(), 145.00, 'EUR'
        );

        $this->mock(PaystackService::class, function ($mock) use ($payment) {
            $mock->shouldReceive('verifyTransaction')->andReturn([
                'success' => true,
                'data' => [
                    'reference' => $payment->transaction_id,
                    'amount' => 145.00,
                    'currency' => 'EUR',
                    'status' => 'success',
                ],
            ]);
        });

        $this->withToken($this->bearerFor($owner))
            ->postJson('/api/v1/library/verify', [
                'gateway' => 'paystack',
                'reference' => $payment->transaction_id,
            ])
            ->assertOk();

        $this->assertSame('paid', $payment->fresh()->status);
        $this->assertDatabaseHas('book_loans', [
            'user_id' => $owner->id,
            'book_id' => $book->id,
            'loan_type' => 'purchase',
        ]);
    }

    public function test_a_signed_in_reader_checks_out_without_repeating_their_email(): void
    {
        $book = $this->book();
        $owner = $this->member();

        $this->withToken($this->bearerFor($owner))
            ->postJson('/api/v1/library/checkout', [
                'book_id' => $book->id,
                'mode' => 'purchase',
                'gateway' => 'manual',
            ])
            ->assertCreated();

        $this->assertDatabaseHas('payments', [
            'user_id' => $owner->id,
            'payable_type' => Book::class,
            'payable_id' => $book->id,
        ]);
    }

    public function test_guest_checkout_never_issues_a_token_for_an_existing_reader(): void
    {
        // An address alone is not proof of ownership, so an account that already
        // exists must never be handed a credential to an anonymous caller.
        $book = $this->book();
        $victim = $this->member();
        $tokensBefore = $victim->tokens()->count();

        $this->postJson('/api/v1/library/checkout', [
            'book_id' => $book->id,
            'mode' => 'purchase',
            'gateway' => 'manual',
            'email' => $victim->email,
        ])->assertStatus(401);

        $this->assertSame($tokensBefore, $victim->tokens()->count());
        $this->assertDatabaseMissing('payments', ['user_id' => $victim->id]);
    }

    public function test_a_gateway_result_for_a_different_amount_is_refused(): void
    {
        $book = $this->book();
        $owner = $this->member();

        $payment = app(BookCheckoutService::class)->recordPayment(
            $owner, $book, 'purchase', 'paystack', 'pending',
            'pstk_short_'.uniqid(), 145.00, 'EUR'
        );

        $this->mock(PaystackService::class, function ($mock) use ($payment) {
            $mock->shouldReceive('verifyTransaction')->andReturn([
                'success' => true,
                'data' => [
                    'reference' => $payment->transaction_id,
                    'amount' => 1.00,
                    'currency' => 'EUR',
                    'status' => 'success',
                ],
            ]);
        });

        $this->actingAs($owner)
            ->postJson('/api/v1/library/verify', [
                'gateway' => 'paystack',
                'reference' => $payment->transaction_id,
            ])
            ->assertStatus(422);

        $this->assertSame('pending', $payment->fresh()->status);
        $this->assertDatabaseMissing('book_loans', ['book_id' => $book->id]);
    }

    public function test_the_reader_who_paid_settles_their_own_payment(): void
    {
        $book = $this->book();
        $owner = $this->member();

        $payment = app(BookCheckoutService::class)->recordPayment(
            $owner, $book, 'purchase', 'paystack', 'pending',
            'pstk_good_'.uniqid(), 145.00, 'EUR'
        );

        $this->mock(PaystackService::class, function ($mock) use ($payment) {
            $mock->shouldReceive('verifyTransaction')->andReturn([
                'success' => true,
                'data' => [
                    'reference' => $payment->transaction_id,
                    'amount' => 145.00,
                    'currency' => 'EUR',
                    'status' => 'success',
                ],
            ]);
        });

        $this->actingAs($owner)
            ->postJson('/api/v1/library/verify', [
                'gateway' => 'paystack',
                'reference' => $payment->transaction_id,
            ])
            ->assertOk();

        $this->assertSame('paid', $payment->fresh()->status);
        $this->assertDatabaseHas('book_loans', [
            'user_id' => $owner->id,
            'book_id' => $book->id,
            'loan_type' => 'purchase',
        ]);
    }

    public function test_a_local_source_url_is_never_proxied(): void
    {
        $book = $this->book(['file_url' => 'file:///etc/passwd']);
        $user = $this->member();
        $loan = app(BookCheckoutService::class)->grantAccess($book, $user, 'purchase');

        $signed = URL::temporarySignedRoute('api.v1.library.download.serve', now()->addMinutes(5), ['loan' => $loan->id]);

        $this->actingAs($user)->get($signed)->assertNotFound();
        $this->assertSame(0, $loan->fresh()->download_count);
    }

    public function test_settling_a_payment_twice_grants_only_one_loan(): void
    {
        // The gateway round trip is slow enough for a webhook to settle the same
        // payment first; fulfilment must still happen exactly once.
        $book = $this->book();
        $owner = $this->member();

        $payment = app(BookCheckoutService::class)->recordPayment(
            $owner, $book, 'purchase', 'paystack', 'pending',
            'pstk_race_'.uniqid(), 145.00, 'EUR'
        );

        $this->mock(PaystackService::class, function ($mock) use ($payment) {
            $mock->shouldReceive('verifyTransaction')->andReturn([
                'success' => true,
                'data' => [
                    'reference' => $payment->transaction_id,
                    'amount' => 145.00,
                    'currency' => 'EUR',
                    'status' => 'success',
                ],
            ]);
        });

        // A webhook settles the payment while the reader's browser is in flight.
        $payment->update(['status' => 'paid']);
        app(MembershipPaymentService::class)->fulfil($payment);

        $response = $this->actingAs($owner)->postJson('/api/v1/library/verify', [
            'gateway' => 'paystack',
            'reference' => $payment->transaction_id,
        ]);

        $response->assertOk();
        $this->assertSame(1, BookLoan::where('payment_id', $payment->id)->count());
    }

    public function test_a_refused_acquisition_provisions_no_guest_account(): void
    {
        // A title with no rental price cannot be rented, and that judgement does
        // not depend on who is asking, so no reader account should be created.
        $book = $this->book([
            'allow_rental' => true,
            'rental_price' => 0,
        ]);

        $this->postJson('/api/v1/library/checkout', [
            'book_id' => $book->id,
            'mode' => 'rental',
            'gateway' => 'manual',
            'email' => 'ghost.reader@example.com',
        ])->assertStatus(422);

        $this->assertDatabaseMissing('users', ['email' => 'ghost.reader@example.com']);
        $this->assertDatabaseMissing('payments', ['payable_type' => Book::class, 'payable_id' => $book->id]);
    }

    public function test_a_partial_update_preserves_the_stored_currency(): void
    {
        $book = $this->book(['currency' => 'GBP']);

        $this->actingAs($this->admin())
            ->putJson("/api/v1/admin/archive/books/{$book->id}", [
                'title' => 'A Revised Sovereignty',
            ])
            ->assertOk();

        $this->assertSame('GBP', $book->fresh()->currency);
    }

    public function test_a_title_page_reports_the_readers_own_access(): void
    {
        // A bearer client on this public route must see its holding, or a buyer
        // is told their title is not in their archive.
        $book = $this->book();
        $owner = $this->member();
        app(BookCheckoutService::class)->grantAccess($book, $owner, 'purchase');

        $response = $this->withToken($this->bearerFor($owner))
            ->getJson('/api/v1/library/books/'.$book->slug);

        $response->assertOk();
        $this->assertSame('purchase', $response->json('data.access.loan_type'));
    }
}
