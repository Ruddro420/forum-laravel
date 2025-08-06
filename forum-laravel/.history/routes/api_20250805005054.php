<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ForumController;

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
Route::get('/category', [ForumController::class, 'cindex']);
