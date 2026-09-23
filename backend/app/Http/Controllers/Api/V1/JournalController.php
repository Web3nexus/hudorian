<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\JournalPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JournalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = JournalPost::with('category')
            ->where('is_published', true);

        if ($request->filled('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        $posts = $query->orderByDesc('published_at')->get();

        return response()->json([
            'data' => $posts,
            'categories' => Category::all(),
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $post = JournalPost::with('category')
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        $related = JournalPost::with('category')
            ->where('id', '!=', $post->id)
            ->where('is_published', true)
            ->limit(3)
            ->get();

        return response()->json([
            'data' => $post,
            'related' => $related,
        ]);
    }

    public function categories(): JsonResponse
    {
        return response()->json([
            'data' => Category::withCount(['posts' => function ($q) {
                $q->where('is_published', true);
            }])->get(),
        ]);
    }
}

