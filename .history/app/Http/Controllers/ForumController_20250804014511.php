<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;
use Inertia\Inertia;

class ForumController extends Controller
{
     public function cindex()
    {
        $categories = Category::all();
        return Inertia::render('Category', ['categories' => $categories]);
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
}
