<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Services\Audit\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminMemberController extends Controller
{
    protected AuditLogger $auditLogger;

    public function __construct(AuditLogger $auditLogger)
    {
        $this->auditLogger = $auditLogger;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Member::with(['user', 'plan']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('membership_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        $members = $query->orderByDesc('created_at')->paginate(20);

        return response()->json($members);
    }

    public function show(int $id): JsonResponse
    {
        $member = Member::with([
            'user.reservations.room.house',
            'user.eventBookings.event',
            'user.payments',
            'plan',
        ])->findOrFail($id);

        return response()->json([
            'data' => $member,
        ]);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:active,suspended,cancelled,expired',
            'internal_notes' => 'nullable|string',
        ]);

        $member = Member::findOrFail($id);
        $oldStatus = $member->status;
        $member->status = $request->status;

        if ($request->filled('internal_notes')) {
            $member->internal_notes = $request->internal_notes;
        }

        $member->save();

        $this->auditLogger->log(
            $request->user(),
            'member.status_changed',
            'Member',
            $member->id,
            ['old_status' => $oldStatus, 'new_status' => $member->status, 'notes' => $request->internal_notes]
        );

        return response()->json([
            'message' => 'Member status updated successfully.',
            'data' => $member->load('user', 'plan'),
        ]);
    }
}

