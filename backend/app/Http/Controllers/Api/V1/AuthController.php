<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Audit\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    protected AuditLogger $auditLogger;

    public function __construct(AuditLogger $auditLogger)
    {
        $this->auditLogger = $auditLogger;
    }

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:30',
            'country' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'country' => $validated['country'] ?? null,
            'city' => $validated['city'] ?? null,
            'role' => 'member',
        ]);

        $token = $user->createToken('hudorian-member-session')->plainTextToken;

        $this->auditLogger->log($user, 'user.registered', 'User', $user->id);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'token' => $token,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::with(['member.plan'])->where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        if (! $user->is_active) {
            return response()->json([
                'message' => 'Your account has been deactivated.',
            ], 403);
        }

        $token = $user->createToken('hudorian-member-session')->plainTextToken;

        $this->auditLogger->log($user, 'user.login', 'User', $user->id);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone,
                'city' => $user->city,
                'country' => $user->country,
                'member' => $user->member ? [
                    'id' => $user->member->id,
                    'membership_number' => $user->member->membership_number,
                    'status' => $user->member->status,
                    'plan' => $user->member->plan ? [
                        'name' => $user->member->plan->name,
                        'slug' => $user->member->plan->slug,
                        'house_access_type' => $user->member->plan->house_access_type,
                    ] : null,
                    'expires_at' => $user->member->expires_at?->toDateString(),
                ] : null,
            ],
            'token' => $token,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['member.plan']);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone,
                'city' => $user->city,
                'country' => $user->country,
                'member' => $user->member ? [
                    'id' => $user->member->id,
                    'membership_number' => $user->member->membership_number,
                    'status' => $user->member->status,
                    'plan' => $user->member->plan ? [
                        'name' => $user->member->plan->name,
                        'slug' => $user->member->plan->slug,
                        'house_access_type' => $user->member->plan->house_access_type,
                    ] : null,
                    'expires_at' => $user->member->expires_at?->toDateString(),
                ] : null,
            ],
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:30',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'current_password' => 'nullable|required_with:new_password',
            'new_password' => 'nullable|string|min:8',
        ]);

        if (! empty($validated['new_password'])) {
            if (! Hash::check($validated['current_password'], $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => ['Current password is incorrect.'],
                ]);
            }
            $user->password = Hash::make($validated['new_password']);
        }

        $user->fill(array_filter([
            'name' => $validated['name'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'city' => $validated['city'] ?? null,
            'country' => $validated['country'] ?? null,
        ]))->save();

        $this->auditLogger->log($user, 'user.profile_updated', 'User', $user->id);

        $user->load(['member.plan']);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone,
                'city' => $user->city,
                'country' => $user->country,
                'member' => $user->member ? [
                    'id' => $user->member->id,
                    'membership_number' => $user->member->membership_number,
                    'status' => $user->member->status,
                    'plan' => $user->member->plan ? [
                        'name' => $user->member->plan->name,
                        'slug' => $user->member->plan->slug,
                        'house_access_type' => $user->member->plan->house_access_type,
                    ] : null,
                    'expires_at' => $user->member->expires_at?->toDateString(),
                ] : null,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }
}

