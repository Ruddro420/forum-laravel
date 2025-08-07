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

Route::get('/category', [ForumController::class, 'index']);
Route::post('/category', [ForumController::class, 'store']);
Route::put('/category/{id}', [ForumController::class, 'update']);
Route::delete('/category/{id}', [ForumController::class, 'destroy']);

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
