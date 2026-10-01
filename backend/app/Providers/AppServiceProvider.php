<?php

namespace App\Providers;

use App\Services\Payments\MockPaymentGateway;
use App\Services\Payments\PaymentGatewayInterface;
use App\Services\SecureGate\SecureGateAdapter;
use App\Services\SecureGate\SecureGateServiceInterface;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(SecureGateServiceInterface::class, SecureGateAdapter::class);
        $this->app->singleton(PaymentGatewayInterface::class, MockPaymentGateway::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->registerAuthRateLimiters();
    }

    /**
     * Brute-force limits for the authentication surface.
     *
     * Limits are keyed on the submitted identifier as well as the caller's IP so
     * that neither a single host hammering one account, nor a botnet spreading
     * many requests across addresses, can make unlimited guesses.
     */
    protected function registerAuthRateLimiters(): void
    {
        $byIdentifierAndIp = function (Request $request): string {
            $identifier = strtolower(trim((string) $request->input('email', '')));

            return 'auth:'.md5($identifier.'|'.$request->ip());
        };

        $byIp = fn (Request $request): string => 'auth-ip:'.$request->ip();

        // Credential submissions: 5 per identifier/IP pair per minute, and a
        // wider ceiling per IP alone to catch spraying across many accounts.
        // Every limit carries the same response body so a caller cannot tell
        // which ceiling they just met.
        RateLimiter::for('login', function (Request $request) use ($byIdentifierAndIp, $byIp) {
            return [
                Limit::perMinute(5)->by($byIdentifierAndIp($request))->response(
                    fn () => $this->tooManyAttempts('Too many sign-in attempts. Please wait a moment and try again.', 'login')
                ),
                Limit::perMinute(20)->by($byIp($request))->response(
                    fn () => $this->tooManyAttempts('Too many sign-in attempts. Please wait a moment and try again.', 'login')
                ),
            ];
        });

        // SecureGate clearance: tighter, because this route is an admin surface.
        // The per-identifier ceiling sits above the service-level lockout so
        // the account lockout is what actually reports the refusal.
        RateLimiter::for('admin-login', function (Request $request) use ($byIdentifierAndIp, $byIp) {
            return [
                Limit::perMinute(8)->by($byIdentifierAndIp($request))->response(
                    fn () => $this->tooManyAttempts('Too many clearance attempts. Access is temporarily suspended for this identifier.', 'admin-login')
                ),
                Limit::perMinute(15)->by($byIp($request))->response(
                    fn () => $this->tooManyAttempts('Too many clearance attempts. Access is temporarily suspended for this identifier.', 'admin-login')
                ),
            ];
        });

        // The TOTP challenge is a 6-digit space, so it gets its own budget and
        // must not share the password limiter's counter. The route ceiling is
        // deliberately looser than the service cap of five: the service is what
        // burns an exhausted challenge, and this is the coarse outer bound.
        RateLimiter::for('mfa', function (Request $request) use ($byIp) {
            return [
                Limit::perMinute(10)->by($byIp($request).'|mfa')->response(
                    fn () => $this->tooManyAttempts('Too many verification codes submitted. Request a new challenge and wait before trying again.', 'mfa')
                ),
            ];
        });

        // Password recovery and registration are abuse surfaces too: they send
        // mail and create accounts, so they get a much smaller budget.
        RateLimiter::for('password-flow', function (Request $request) use ($byIp) {
            return [
                Limit::perMinute(3)->by($byIp($request).'|password-flow')->response(
                    fn () => $this->tooManyAttempts('Too many requests. Please wait before trying again.', 'password-flow')
                ),
            ];
        });
    }

    /**
     * Uniform 429 for every throttled auth route, so a caller cannot tell which
     * limit was hit and cannot use the shape of the response to map the system.
     */
    protected function tooManyAttempts(string $message, string $context): JsonResponse
    {
        return response()->json([
            'error' => 'Too Many Attempts',
            'message' => $message,
            'context' => $context,
        ], 429);
    }
}
