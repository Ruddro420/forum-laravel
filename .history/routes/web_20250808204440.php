<?php

use App\Http\Controllers\BookController;
use App\Http\Controllers\ChatController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ForumController;
use App\Http\Controllers\PostController;
use Illuminate\Http\Request;
use Ably\AblyRest;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('category', function () {
        return Inertia::render('category');
    })->name('category');
});
// Category routes
Route::get('/category', [ForumController::class, 'cindex']);
Route::post('/category', [ForumController::class, 'cstore']);
Route::put('/category/{id}', [ForumController::class, 'cupdate']);
Route::delete('/category/{id}', [ForumController::class, 'cdestroy']);
// sub-category routes
// Route::get('/subcategory', function () {
//     return Inertia::render('SubCategory');
// })->name('subcategory');

Route::get('/subcategory', [ForumController::class, 'scindex']);
Route::post('/subcategory', [ForumController::class, 'scstore']);
Route::put('/subcategory/{id}', [ForumController::class, 'scupdate']);
Route::delete('/subcategory/{id}', [ForumController::class, 'scdestroy']);

// User - Panel
Route::get('/users', [ForumController::class, 'cusers'])->name('getUsers');
// Update user status
Route::put('/users/{user}', [ForumController::class, 'cuupdate'])->name('users.update');
Route::delete('/users/{user}', [ForumController::class, 'cudestroy'])->name('users.destroy');
// Post - Panel
Route::prefix('posts')->name('posts.')->group(function () {
    Route::get('/',       [PostController::class, 'pIndex'])->name('index');
    Route::get('/create', [PostController::class, 'pCreate'])->name('create');
    Route::post('/',      [PostController::class, 'pStore'])->name('store');
    Route::get('/{post}', [PostController::class, 'pShow'])->name('show');
    Route::get('/{post}/edit', [PostController::class, 'pEdit'])->name('edit');
    Route::put('/{post}', [PostController::class, 'pUpdate'])->name('update');
    Route::delete('/{post}', [PostController::class, 'pDestroy'])->name('destroy');
});
// Books Panel

Route::get('/bookShow', [BookController::class, 'index'])->name('books.index');
Route::post('/add/books', [BookController::class, 'store'])->name('books.store');
Route::put('/books/{id}/status', [BookController::class, 'updateStatus'])->name('books.updateStatus');
Route::delete('/books/{id}', [BookController::class, 'destroy'])->name('books.destroy');


// Route::get('/chat', [ChatController::class, 'index'])->name('chat');


// chatting setup
Route::post('/ably/auth', function (Request $request) {
    $user = $request->user();
    $ably = new AblyRest(config('ably.key'));

    // Create capabilities based on user role
    $capabilities = $user->is_admin
        ? ['chat:*' => ['publish', 'subscribe']] // Admin can access all channels
        : ["chat:user_{$user->id}" => ['publish', 'subscribe']]; // User can only access their channel

    $tokenRequest = $ably->auth->requestToken([
        'capability' => $capabilities,
        'clientId' => $user->id,
    ]);

    return response()->json($tokenRequest);
})->middleware('auth');


// routes/web.php
Route::get('/chat', [ChatController::class, 'index'])->middleware('auth');
Route::get('/chat/messages/{userId}', [ChatController::class, 'messages'])->middleware('auth');
Route::post('/chat/send', [ChatController::class, 'store'])->middleware('auth');




require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
