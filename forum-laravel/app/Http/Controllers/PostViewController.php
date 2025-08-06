<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PostView;

class PostViewController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'post_id' => 'required|exists:posts,id',
            'user_id' => 'required|exists:user_entries,id',
        ]);

        // Only store if not already viewed
        $view = PostView::firstOrCreate([
            'post_id' => $validated['post_id'],
            'user_id' => $validated['user_id'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'View recorded.',
        ]);
    }

    public function count($post_id)
    {
        $count = PostView::where('post_id', $post_id)->count();

        return response()->json([
            'success' => true,
            'post_id' => $post_id,
            'views' => $count,
        ]);
    }
}
