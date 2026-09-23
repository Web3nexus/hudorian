<?php

namespace App\Http\Middleware;

use App\Services\Audit\AuditLogger;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecureGateMiddleware
{
    protected AuditLogger $auditLogger;

    public function __construct(AuditLogger $auditLogger)
    {
        $this->auditLogger = $auditLogger;
    }

    /**
     * Handle an incoming admin request.
     */
    public function handle(Request $request, Closure $next, ?string $requiredPermission = null): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'error' => 'Unauthenticated',
                'message' => 'SecureGate session required. Please authenticate.',
            ], 401);
        }

        if (! $user->isAdmin()) {
            $this->auditLogger->log(
                $user,
                'securegate.unauthorized_access_attempt',
                'Route',
                null,
                ['path' => $request->path(), 'method' => $request->method()]
            );

            return response()->json([
                'error' => 'Forbidden',
                'message' => 'Access denied: Requires SecureGate administrative clearance.',
            ], 403);
        }

        if (! $user->is_active) {
            return response()->json([
                'error' => 'Forbidden',
                'message' => 'Your administrative account has been deactivated.',
            ], 403);
        }

        return $next($request);
    }
}

