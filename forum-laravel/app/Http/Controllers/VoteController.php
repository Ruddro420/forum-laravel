<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Vote;
use Illuminate\Http\Request;

class VoteController extends Controller
{
    public function vote(Request $request)
    {
        $validated = $request->validate([
            'post_id' => 'required|exists:posts,id',
            'user_id' => 'required|exists:user_entries,id',
            'vote'    => 'required|in:upvote,downvote',
        ]);

        $existing = Vote::where('post_id', $validated['post_id'])
            ->where('user_id', $validated['user_id'])
            ->first();

        if ($existing) {
            if ($existing->vote === $validated['vote']) {
                return response()->json([
                    'success' => false,
                    'message' => 'You have already ' . $validated['vote'] . 'd this post.',
                ], 400);
            }

            // Change vote
            $existing->update(['vote' => $validated['vote']]);

            return response()->json([
                'success' => true,
                'message' => 'Vote updated to ' . $validated['vote'],
            ]);
        }

        // Create new vote
        Vote::create($validated);

        return response()->json([
            'success' => true,
            'message' => ucfirst($validated['vote']) . ' recorded.',
        ]);
    }

    public function count($post_id)
    {
        $post = Post::withCount([
            'upvotes',
            'downvotes'
        ])->find($post_id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Post not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'upvotes' => $post->upvotes_count,
                'downvotes' => $post->downvotes_count,
            ]
        ]);
    }
}
