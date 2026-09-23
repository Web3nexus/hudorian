<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\CmsBlock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CmsController extends Controller
{
    /**
     * Get all CMS blocks keyed by their identifier.
     */
    public function blocks(): JsonResponse
    {
        $blocks = CmsBlock::all()->keyBy('key');

        return response()->json([
            'data' => $blocks,
        ]);
    }

    /**
     * Get a specific CMS block by key.
     */
    public function show(string $key): JsonResponse
    {
        $block = CmsBlock::where('key', $key)->firstOrFail();

        return response()->json([
            'data' => $block,
        ]);
    }

    /**
     * Update or create a single CMS block.
     */
    public function update(Request $request, string $key): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'nullable|string',
            'subtitle' => 'nullable|string',
            'body' => 'nullable|string',
            'media_url' => 'nullable|string',
            'payload' => 'nullable|array',
        ]);

        $block = CmsBlock::updateOrCreate(
            ['key' => $key],
            $validated
        );

        // Record audit log
        $user = $request->user();
        AuditLog::create([
            'user_id' => $user?->id,
            'actor_name' => $user ? $user->first_name . ' ' . $user->last_name : 'SecureGate Admin',
            'action' => 'cms.updated',
            'entity_type' => 'CmsBlock',
            'entity_id' => $block->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'details' => [
                'block_key' => $key,
                'updated_fields' => array_keys($validated),
            ],
        ]);

        return response()->json([
            'message' => "CMS block '{$key}' updated successfully.",
            'data' => $block,
        ]);
    }

    /**
     * Batch update multiple CMS blocks.
     */
    public function batchUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'blocks' => 'required|array',
            'blocks.*.key' => 'required|string',
            'blocks.*.title' => 'nullable|string',
            'blocks.*.subtitle' => 'nullable|string',
            'blocks.*.body' => 'nullable|string',
            'blocks.*.media_url' => 'nullable|string',
            'blocks.*.payload' => 'nullable|array',
        ]);

        DB::transaction(function () use ($validated, $request) {
            foreach ($validated['blocks'] as $item) {
                CmsBlock::updateOrCreate(
                    ['key' => $item['key']],
                    [
                        'title' => $item['title'] ?? null,
                        'subtitle' => $item['subtitle'] ?? null,
                        'body' => $item['body'] ?? null,
                        'media_url' => $item['media_url'] ?? null,
                        'payload' => $item['payload'] ?? null,
                    ]
                );
            }

            $user = $request->user();
            AuditLog::create([
                'user_id' => $user?->id,
                'actor_name' => $user ? $user->first_name . ' ' . $user->last_name : 'SecureGate Admin',
                'action' => 'cms.batch_updated',
                'entity_type' => 'CmsBlock',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'details' => [
                    'updated_keys' => array_column($validated['blocks'], 'key'),
                ],
            ]);
        });

        $allBlocks = CmsBlock::all()->keyBy('key');

        return response()->json([
            'message' => 'CMS blocks updated successfully in batch.',
            'data' => $allBlocks,
        ]);
    }
}
