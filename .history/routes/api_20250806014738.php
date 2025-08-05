<?php

use App\Http\Controllers\CommentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ForumController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| These routes are loaded by the RouteServiceProvider within a group
| which is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Example route
Route::get('/ping', function () {
    return response()->json(['message' => 'API is working!']);
});

// Category API routes
Route::get('/category', [ForumController::class, 'cApiIndex']);
// add user entry API route
Route::post('/user-entry', [ForumController::class, 'ustore']);
// User Authentication
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/me', [AuthController::class, 'me']);
// get api all post
Route::get('/posts', [PostController::class, 'getPostApi']);
// get api by category
Route::get('/posts/category/{category_id}', [PostController::class, 'byCategory']);
// get api by subcategory
Route::get('/posts/sub-category/{sub_category_id}', [PostController::class, 'bySubCategory']);
// get api by category & Subcategory
Route::get('/posts/filter/{category_id}/{sub_category_id?}', [PostController::class, 'filter']);
// get api by student id
Route::get('/posts/student/{student_id}', [PostController::class, 'getByStudent']);
// get post by post id
Route::get('/posts/{id}', [PostController::class, 'postshow']);
// store post
Route::post('/posts', [PostController::class, 'storePostApi']);

// comment panel
Route::prefix('comments')->group(function () {
    Route::post('/store', [CommentController::class, 'store']);
    Route::get('/{id}', [CommentController::class, 'show']);
    Route::delete('/{id}', [CommentController::class, 'destroy']);
});
