<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ForumController;

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
Route::get('/subcategory', function () {
    return Inertia::render('SubCategory');
})->name('subcategory');

Route::get('/subcategory', [ForumController::class, 'scindex']);
Route::post('/subcategory', [ForumController::class, 'scstore']);
Route::put('/subcategory/{id}', [ForumController::class, 'scupdate']);
Route::delete('/subcategory/{id}', [ForumController::class, 'scdestroy']);

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
