<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Category;
use App\Models\SubCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

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


    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'sub_category_id' => 'nullable|exists:sub_categories,id',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'book_file' => 'nullable|file|mimes:pdf,epub|max:10240',
            'cover_image' => 'nullable|image|max:5120',
            'status' => 'required|in:active,inactive,pending',
        ]);

        $book = new Book();
        $book->name = $request->name;
        $book->category_id = $request->category_id;
        $book->sub_category_id = $request->sub_category_id;
        $book->description = $request->description;
        $book->price = $request->price;
        $book->status = $request->status;

        if ($request->hasFile('book_file')) {
            $bookFile = $request->file('book_file');
            $bookFileName = Str::random(20) . '.' . $bookFile->getClientOriginalExtension();
            $bookFile->move(public_path('books/files'), $bookFileName);
            $book->book_file = 'books/files/' . $bookFileName;
        }

        if ($request->hasFile('cover_image')) {
            $coverImage = $request->file('cover_image');
            $coverImageName = Str::random(20) . '.' . $coverImage->getClientOriginalExtension();
            $coverImage->move(public_path('books/images'), $coverImageName);
            $book->cover_image = 'books/images/' . $coverImageName;
        }


        $book->save();

        return redirect()->route('books.index')->with('success', 'Book created successfully.');
    }



    // Update book status
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required',
        ]);
        $book = Book::findOrFail($id);
        $book->status = $request->status;
        $book->save();

        return redirect()->back()->with('success', 'Book status updated.');
    }

    // Delete a book
    public function destroy($id)
    {
        $book = Book::findOrFail($id);

        if ($book->book_file) Storage::disk('public')->delete($book->book_file);
        if ($book->cover_image) Storage::disk('public')->delete($book->cover_image);

        $book->delete();

        return redirect()->back()->with('success', 'Book deleted successfully.');
    }
    // get api for books
    public function activeBooks()
    {
        $books = Book::with(['category', 'subCategory'])
            ->where('status', 'active')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $books
        ]);
    }
}
