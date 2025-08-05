<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\SubCategory;
use Inertia\Inertia;
use App\Models\UserEntry;
use App\Models\Post;

class ForumController extends Controller
{
    public function cindex()
    {
        $categories = Category::all();
        return Inertia::render('category', ['categories' => $categories]);
    }
    // api method for categories with subcategories
    public function cApiIndex()
    {
        $categories = Category::with('subcategories')->get();
        return response()->json($categories);
    }

    public function cstore(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);
        Category::create(['name' => $request->name]);
        return redirect()->back();
    }

    public function cupdate(Request $request, $id)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $category = Category::findOrFail($id);
        $category->update(['name' => $request->name]);
        return redirect()->back();
    }

    public function cdestroy($id)
    {
        Category::destroy($id);
        return redirect()->back();
    }
    // sub category
    public function scindex()
    {
        return Inertia::render('SubCategory', [
            'categories' => Category::all(),
            'subcategories' => SubCategory::with('category')->get()
        ]);
    }

    public function scstore(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'category_id' => 'required|exists:categories,id',
        ]);

        SubCategory::create($request->only('name', 'category_id'));
    }

    public function scupdate(Request $request, $id)
    {
        $request->validate([
            'name' => 'required',
            'category_id' => 'required|exists:categories,id',
        ]);

        $subcategory = SubCategory::findOrFail($id);
        $subcategory->update($request->only('name', 'category_id'));
    }

    public function scdestroy($id)
    {
        SubCategory::findOrFail($id)->delete();
    }
    // store user entry
    public function ustore(Request $request)
    {
        $validated = $request->validate([
            'first_name'      => 'required|string|max:100',
            'last_name'       => 'required|string|max:100',
            'email'           => 'required|email|unique:user_entries,email',
            'category_id'        => 'required|string',
            'sub_category_id'    => 'required|string',
            'institute_type'  => 'required|string',
            'password'        => 'required|string|min:6',
            // 'status'          => 'nullable|numeric|in:0,1',
        ]);

        $user = UserEntry::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'User entry created successfully',
            'data' => $user
        ], 201);
    }
    // get users
    public function cusers()
    {
        $users = UserEntry::with(['category', 'subcategory'])->get();
        return Inertia::render('UserPanel', ['users' => $users]);
    }
    // edit users status
    public function cuupdate(Request $request, UserEntry $user) // Fix the type hint here
    {
        $validated = $request->validate([
            'status' => 'required|string|in:active,inactive,pending',
        ]);

        $user->update($validated);
    }
    public function cudestroy(UserEntry $user)
    {
        $user->delete();

        return back()->with('success', 'User deleted successfully');
    }
    // Post Panel
    public function pstore(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'sub_category_id' => 'nullable|exists:sub_categories,id',
            'details' => 'nullable|string',
            'tag' => 'nullable|string|max:255',
            'student_id' => 'required|exists:user_entries,id', // your custom user table
            'status' => 'nullable|in:active,inactive,pending',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,mp4,mov|max:10240',
            'post_img' => 'nullable|image|mimes:jpg,jpeg,png|max:5120',
            'ex1' => 'nullable|string|max:255',
            'ex2' => 'nullable|string|max:255',
        ]);

        // Handle file uploads
        if ($request->hasFile('file')) {
            $validated['file'] = $request->file('file')->store('uploads/files', 'public');
        }

        if ($request->hasFile('post_img')) {
            $validated['post_img'] = $request->file('post_img')->store('uploads/images', 'public');
        }

        // Set default status if not provided
        if (!isset($validated['status'])) {
            $validated['status'] = 'active';
        }

        Post::create($validated);

        return redirect()->back()->with('success', 'Post created successfully.');
    }
}
