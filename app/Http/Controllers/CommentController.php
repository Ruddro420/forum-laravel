<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use App\Models\UserEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CommentController extends Controller
{
    // Store a new comment
    public function store(Request $request)
    {
        $validated = $request->validate([
            'post_id'   => 'required|exists:posts,id',
            'user_id'   => 'required|exists:user_entries,id',
            'comment'   => 'required|string',
            'role'      => 'nullable|string|in:admin,student', // default handled below
            'file'      => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'ex1'       => 'nullable|string|max:255',
            'ex2'       => 'nullable|string|max:255',
        ]);

        if ($request->hasFile('file')) {
            $validated['file'] = $request->file('file')->store('uploads/comments', 'public');
        }

        $validated['role'] = $validated['role'] ?? 'student';
        $validated['status'] = 1;

        $comment = Comment::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Comment created successfully.',
            'data' => $comment,
        ]);
    }

    // Show a comment by ID
    public function show($id)
    {
        $comment = Comment::with(['post:id,title', 'user:id,name,email'])->find($id);

        if (!$comment) {
            return response()->json([
                'success' => false,
                'message' => 'Comment not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $comment,
        ]);
    }

    // Delete a comment
    public function destroy($id)
    {
        $comment = Comment::find($id);

        if (!$comment) {
            return response()->json([
                'success' => false,
                'message' => 'Comment not found',
            ], 404);
        }

        // Delete file if exists
        if ($comment->file && Storage::disk('public')->exists($comment->file)) {
            Storage::disk('public')->delete($comment->file);
        }

        $comment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Comment deleted successfully.',
        ]);
    }
}
