<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Category;
use App\Models\SubCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Str;

class BookController extends Controller
{
    // List all books
    public function index()
    {
        $books = Book::with('category', 'subCategory')->get();
        $categories = Category::all();
        $subCategories = SubCategory::all();
        return Inertia::render('Books', compact('books', 'categories', 'subCategories'));
    }


}
