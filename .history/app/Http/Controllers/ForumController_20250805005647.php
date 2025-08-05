<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\SubCategory;
use Inertia\Inertia;

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
}
