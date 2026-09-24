<?php

use App\Http\Controllers\Api\V1\AdminApplicationController;
use App\Http\Controllers\Api\V1\AdminAuditLogController;
use App\Http\Controllers\Api\V1\AdminAuthController;
use App\Http\Controllers\Api\V1\AdminDashboardController;
use App\Http\Controllers\Api\V1\AdminEventController;
use App\Http\Controllers\Api\V1\AdminHouseController;
use App\Http\Controllers\Api\V1\AdminMemberController;
use App\Http\Controllers\Api\V1\AdminPaymentController;
use App\Http\Controllers\Api\V1\AdminRoomController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CmsController;
use App\Http\Controllers\Api\V1\CurrencyController;
use App\Http\Controllers\Api\V1\EstateController;
use App\Http\Controllers\Api\V1\EventController;
use App\Http\Controllers\Api\V1\HouseController;
use App\Http\Controllers\Api\V1\JournalController;
use App\Http\Controllers\Api\V1\MemberPortalController;
use App\Http\Controllers\Api\V1\MembershipController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\StayController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // ==========================================
    // PUBLIC ENDPOINTS
    // ==========================================

    // Discovery & Properties
    Route::get('/houses', [HouseController::class, 'index']);
    Route::get('/houses/{slug}', [HouseController::class, 'show']);

    Route::get('/estates', [EstateController::class, 'index']);
    Route::get('/estates/{slug}', [EstateController::class, 'show']);

    // Stays & Rooms
    Route::get('/stays', [StayController::class, 'index']);
    Route::get('/stays/{slug}', [StayController::class, 'show']);
    Route::post('/stays/check-availability', [StayController::class, 'checkAvailability']);

    // Curated Events
    Route::get('/events', [EventController::class, 'index']);
    Route::get('/events/{slug}', [EventController::class, 'show']);

    // Membership Plans & Application
    Route::get('/membership/plans', [MembershipController::class, 'plans']);
    Route::post('/membership/apply', [MembershipController::class, 'apply']);

    // Digital Membership Card Verification (Concierge / Gate)
    Route::get('/verify-card/{token}', [MembershipController::class, 'verifyCard']);

    // Editorial Journal
    Route::get('/journal', [JournalController::class, 'index']);
    Route::get('/journal/categories', [JournalController::class, 'categories']);
    Route::get('/journal/{slug}', [JournalController::class, 'show']);

    // CMS Blocks
    Route::get('/cms/blocks', [CmsController::class, 'blocks']);
    Route::get('/cms-blocks', [CmsController::class, 'blocks']);
    Route::get('/cms/blocks/{key}', [CmsController::class, 'show']);

    // Public Authentication
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

    // Public Security Configuration (for Cloudflare / reCAPTCHA widget on login)
    Route::get('/security/config', [AdminAuthController::class, 'getPublicConfig']);

    // Payment Gateways (Flutterwave, Paystack, Manual Wire)
    Route::get('/payments/config', [PaymentController::class, 'config']);
    Route::post('/payments/initialize', [PaymentController::class, 'initialize']);
    Route::post('/payments/verify', [PaymentController::class, 'verify']);

    // Currency Rates & FX Engine (ExchangeRate-API for manual, Flutterwave/Paystack for gateways)
    Route::get('/currency/rates', [CurrencyController::class, 'rates']);
    Route::get('/currency/convert', [CurrencyController::class, 'convert']);
    Route::post('/payments/webhook/flutterwave', [PaymentController::class, 'webhookFlutterwave']);
    Route::post('/payments/webhook/paystack', [PaymentController::class, 'webhookPaystack']);

    // Admin SecureGate Authentication Checkpoints
    Route::post('/admin/auth/login', [AdminAuthController::class, 'login']);
    Route::post('/admin/auth/verify-mfa', [AdminAuthController::class, 'verifyMfa']);

    // ==========================================
    // MEMBER PROTECTED ENDPOINTS (Sanctum)
    // ==========================================
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Member Dashboard & Digital Pass
        Route::get('/member/dashboard', [MemberPortalController::class, 'dashboard']);
        Route::get('/member/card', [MembershipController::class, 'card']);
        Route::get('/member/bookings', [MemberPortalController::class, 'bookings']);
        Route::get('/member/payments', [MemberPortalController::class, 'payments']);

        // Bookings
        Route::post('/stays/book', [StayController::class, 'book']);
        Route::post('/events/{id}/book', [EventController::class, 'book']);
    });

    // ==========================================
    // SECURE ADMIN PLATFORM (SecureGate Protected)
    // ==========================================
    Route::middleware(['auth:sanctum', 'securegate'])->prefix('admin')->group(function () {
        Route::post('/auth/logout', [AdminAuthController::class, 'logout']);

        // Dashboard Metrics & Charts
        Route::get('/dashboard/stats', [AdminDashboardController::class, 'stats']);

        // Members Management
        Route::get('/members', [AdminMemberController::class, 'index']);
        Route::get('/members/{id}', [AdminMemberController::class, 'show']);
        Route::put('/members/{id}/status', [AdminMemberController::class, 'updateStatus']);

        // Application Queue Review
        Route::get('/applications', [AdminApplicationController::class, 'index']);
        Route::get('/applications/{id}', [AdminApplicationController::class, 'show']);
        Route::post('/applications/{id}/review', [AdminApplicationController::class, 'review']);

        // Properties & Inventory CRUD
        Route::apiResource('/houses', AdminHouseController::class);
        Route::apiResource('/rooms', AdminRoomController::class);
        Route::apiResource('/events', AdminEventController::class);

        // Payments & Refunds
        Route::get('/payments/settings', [AdminPaymentController::class, 'getSettings']);
        Route::put('/payments/settings', [AdminPaymentController::class, 'updateSettings']);
        Route::get('/payments', [AdminPaymentController::class, 'index']);
        Route::get('/payments/export', [AdminPaymentController::class, 'export']);
        Route::get('/payments/{id}', [AdminPaymentController::class, 'show']);
        Route::post('/payments/{id}/approve', [AdminPaymentController::class, 'approve']);
        Route::post('/payments/{id}/reject', [AdminPaymentController::class, 'reject']);
        Route::post('/payments/{id}/refund', [AdminPaymentController::class, 'refund']);

        // Immutable Audit Trail
        Route::get('/audit-logs', [AdminAuditLogController::class, 'index']);

        // CMS & Site Configuration
        Route::put('/cms/blocks/{key}', [CmsController::class, 'update']);
        Route::post('/cms/batch', [CmsController::class, 'batchUpdate']);

        // Security, Cloudflare/reCAPTCHA Keys & 2FA
        Route::get('/security/settings', [AdminAuthController::class, 'getSecuritySettings']);
        Route::put('/security/settings', [AdminAuthController::class, 'updateSecuritySettings']);
        Route::post('/security/2fa/setup', [AdminAuthController::class, 'setup2fa']);
        Route::post('/security/2fa/confirm', [AdminAuthController::class, 'confirm2fa']);
        Route::post('/security/2fa/disable', [AdminAuthController::class, 'disable2fa']);

        // Admin Profile Management
        Route::get('/profile', [AdminAuthController::class, 'getProfile']);
        Route::put('/profile', [AdminAuthController::class, 'updateProfile']);
    });
});
