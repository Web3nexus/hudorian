<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\SecureGate\SecureGateServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAuthController extends Controller
{
    protected SecureGateServiceInterface $secureGate;

    public function __construct(SecureGateServiceInterface $secureGate)
    {
        $this->secureGate = $secureGate;
    }

    /**
     * Initiate SecureGate Administrative Login.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $deviceContext = [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ];

        $result = $this->secureGate->authenticateAdmin(
            $request->email,
            $request->password,
            null,
            $deviceContext
        );

        if (! $result['success']) {
            return response()->json([
                'error' => 'Authentication Failed',
                'message' => $result['error'],
            ], 401);
        }

        return response()->json([
            'status' => 'mfa_required',
            'requires_mfa' => true,
            'mfa_token' => $result['mfa_token'],
            'message' => 'SecureGate secondary verification code sent.',
            'demo_hint' => 'For development, use code 888888',
        ]);
    }

    /**
     * Verify SecureGate secondary MFA code.
     */
    public function verifyMfa(Request $request): JsonResponse
    {
        $request->validate([
            'mfa_token' => 'required|string',
            'code' => 'required|string',
        ]);

        $deviceContext = [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ];

        $result = $this->secureGate->verifyMfaChallenge(
            $request->mfa_token,
            $request->code,
            $deviceContext
        );

        if (! $result['success']) {
            return response()->json([
                'error' => 'MFA Verification Failed',
                'message' => $result['error'],
            ], 422);
        }

        $user = $result['user'];

        return response()->json([
            'message' => 'SecureGate clearance granted.',
            'admin' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'token' => $result['token'],
        ]);
    }

    /**
     * Terminate active administrative session across devices.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user) {
            $this->secureGate->terminateAdminSession($user);
        }

        return response()->json([
            'message' => 'SecureGate session terminated.',
        ]);
    }
}

