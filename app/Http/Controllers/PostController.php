<?php

namespace App\Http\Controllers;

use App\Models\UserEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Category;
use App\Models\SubCategory;
use App\Models\Post;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    // ✅ Show All Posts
    public function pIndex()
    {
        return Inertia::render('Post', [
            'posts'         => Post::with(['category', 'subCategory'])->orderByDesc('created_at')->get(),
            'categories'    => Category::all(),
            'subCategories' => SubCategory::all(),
        ]);
    }


    // ✅ Store a New Post
    public function pStore(Request $request)
    {
        $validated = $request->validate([
            'title'           => 'required|string|max:255',
            'category_id'     => 'required|exists:categories,id',
            'sub_category_id' => 'nullable|exists:sub_categories,id',
            'details'         => 'nullable|string',
            'tag'             => 'nullable|string|max:255',
            'status'          => 'nullable|in:active,inactive,pending',
            'file'            => 'nullable|file|mimes:pdf,jpg,jpeg,png,mp4,mov|max:10240',
            'post_img'        => 'nullable|image|mimes:jpg,jpeg,png|max:5120',
            'ex1'             => 'nullable|string|max:255',
            'ex2'             => 'nullable|string|max:255',
        ]);

        if ($request->hasFile('file')) {
            $validated['file'] = $request->file('file')->store('uploads/files', 'public');
        }

        if ($request->hasFile('post_img')) {
            $validated['post_img'] = $request->file('post_img')->store('uploads/images', 'public');
        }

        $validated['status'] = $validated['status'] ?? 'active';

        Post::create($validated);

        return redirect()->route('posts.index')->with('success', 'Post created successfully.');
    }

    // ✅ Update Post
    public function pUpdate(Request $request, Post $post)
    {
        $validated = $request->validate([
            'status'          => 'nullable|in:active,inactive,pending',
        ]);

        $validated['status'] = $validated['status'] ?? $post->status;

        $post->update($validated);

        return redirect()->route('posts.index')->with('success', 'Post updated successfully.');
    }

    // ✅ Delete Post
    public function pDestroy(Post $post)
    {
        if ($post->file) {
            Storage::disk('public')->delete($post->file);
        }

        if ($post->post_img) {
            Storage::disk('public')->delete($post->post_img);
        }

        $post->delete();

        return redirect()->route('posts.index')->with('success', 'Post deleted successfully.');
    }

    // get api into post table
    public function getPostApi()
    {
        $posts = Post::with(['category:id,name', 'subCategory:id,name', 'student:id,name,email'])
            ->where('status', 'active')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $posts
        ]);
    }

    public function byCategory($category_id)
    {
        $posts = Post::with(['category:id,name', 'subCategory:id,name', 'student:id,name,email'])
            ->where('category_id', $category_id)
            ->where('status', 'active')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $posts
        ]);
    }

    public function bySubCategory($sub_category_id)
    {
        $posts = Post::with(['category:id,name', 'subCategory:id,name', 'student:id,name,email'])
            ->where('sub_category_id', $sub_category_id)
            ->where('status', 'active')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $posts
        ]);
    }

    public function filter($category_id, $sub_category_id = null)
    {
        if (!Category::where('id', $category_id)->exists()) {
            return response()->json(['success' => false, 'message' => 'Invalid category_id'], 404);
        }

        if ($sub_category_id !== null && !SubCategory::where('id', $sub_category_id)->exists()) {
            return response()->json(['success' => false, 'message' => 'Invalid sub_category_id'], 404);
        }

        $query = Post::with(['category:id,name', 'subCategory:id,name', 'student:id,name,email'])
            ->where('category_id', $category_id)
            ->where('status', 'active');

        if ($sub_category_id) {
            $query->where('sub_category_id', $sub_category_id);
        }

        $posts = $query->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $posts,
        ]);
    }

    public function getByStudent($student_id)
    {
        if (!UserEntry::where('id', $student_id)->exists()) {
            return response()->json(['success' => false, 'message' => 'Invalid student_id'], 404);
        }

        $posts = Post::with(['category:id,name', 'subCategory:id,name', 'student:id,name,email'])
            ->where('student_id', $student_id)
            ->where('status', 'active')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $posts,
        ]);
    }

    public function postshow($id)
    {
        $post = Post::with(['category:id,name', 'subCategory:id,name', 'student:id,name,email'])
            ->where('id', $id)
            ->where('status', 'active')
            ->first();

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Post not found or inactive',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $post,
        ]);
    }
    // store post
    public function storePostApi(Request $request)
    {
        $validated = $request->validate([
            'title'           => 'required|string|max:255',
            'category_id'     => 'required|exists:categories,id',
            'sub_category_id' => 'nullable|exists:sub_categories,id',
            'details'         => 'nullable|string',
            'tag'             => 'nullable|string|max:255',
            'status'          => 'nullable|in:active,inactive,pending',
            'file'            => 'nullable|file|mimes:pdf,jpg,jpeg,png,mp4,mov|max:10240',
            'post_img'        => 'nullable|image|mimes:jpg,jpeg,png|max:5120',
            'ex1'             => 'nullable|string|max:255',
            'ex2'             => 'nullable|string|max:255',
            'student_id'      => 'required|exists:user_entries,id', // ✅ New
        ]);

        if ($request->hasFile('file')) {
            $validated['file'] = $request->file('file')->store('uploads/files', 'public');
        }

        if ($request->hasFile('post_img')) {
            $validated['post_img'] = $request->file('post_img')->store('uploads/images', 'public');
        }

        $validated['status'] = $validated['status'] ?? 'active';

        $post = Post::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Post created successfully.',
            'data' => $post,
        ], 201);
    }
}
