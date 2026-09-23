<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Services\Audit\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminEventController extends Controller
{
    protected AuditLogger $auditLogger;

    public function __construct(AuditLogger $auditLogger)
    {
        $this->auditLogger = $auditLogger;
    }

    public function index(): JsonResponse
    {
        $events = Event::with(['house.location', 'bookings.user'])
            ->orderByDesc('starts_at')
            ->get();

        return response()->json([
            'data' => $events,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'house_id' => 'required|exists:houses,id',
            'title' => 'required|string|max:255',
            'event_type' => 'required|string',
            'short_description' => 'nullable|string|max:500',
            'description' => 'required|string',
            'starts_at' => 'required|date',
            'ends_at' => 'required|date|after:starts_at',
            'location_detail' => 'nullable|string|max:255',
            'capacity' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'currency' => 'required|string|size:3',
            'is_member_only' => 'boolean',
            'hero_image' => 'nullable|string',
            'status' => 'required|in:published,draft,cancelled',
        ]);

        $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(5);

        $event = Event::create($validated);

        $this->auditLogger->log($request->user(), 'event.created', 'Event', $event->id, ['title' => $event->title]);

        return response()->json([
            'message' => 'Event created successfully.',
            'data' => $event->load('house'),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $event = Event::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'event_type' => 'sometimes|string',
            'short_description' => 'nullable|string|max:500',
            'description' => 'sometimes|string',
            'starts_at' => 'sometimes|date',
            'ends_at' => 'sometimes|date|after:starts_at',
            'location_detail' => 'nullable|string|max:255',
            'capacity' => 'sometimes|integer|min:1',
            'price' => 'sometimes|numeric|min:0',
            'is_member_only' => 'boolean',
            'hero_image' => 'nullable|string',
            'status' => 'sometimes|in:published,draft,cancelled',
        ]);

        $event->update($validated);

        $this->auditLogger->log($request->user(), 'event.updated', 'Event', $event->id, ['title' => $event->title]);

        return response()->json([
            'message' => 'Event updated successfully.',
            'data' => $event->load('house'),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $event = Event::findOrFail($id);
        $title = $event->title;
        $event->delete();

        $this->auditLogger->log($request->user(), 'event.deleted', 'Event', $id, ['title' => $title]);

        return response()->json([
            'message' => 'Event deleted successfully.',
        ]);
    }
}

