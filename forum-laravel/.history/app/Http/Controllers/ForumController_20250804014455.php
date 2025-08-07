<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;
use Inertia\Inertia;

class ForumController extends Controller
{
     public function index()
    {
        $categories = Category::all();
        return Inertia::render('Category', ['categories' => $categories]);
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);
        Category::create(['name' => $request->name]);
        return redirect()->back();
    }

    public function update(Request $request, $id)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $category = Category::findOrFail($id);
        $category->update(['name' => $request->name]);
        return redirect()->back();
    }

    public function destroy($id)
    {
        Category::destroy($id);
        return redirect()->back();
    }
}
