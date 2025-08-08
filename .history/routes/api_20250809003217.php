<?php

use App\Http\Controllers\BookController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\PostViewController;
use App\Http\Controllers\VoteController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ForumController;
use App\Http\Controllers\AuthController;



use Ably\AblyRest;
use App\Models\Message;
use App\Models\User;

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
Route::get('/me/{id}', [AuthController::class, 'me']);
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
Route::post('/add/posts', [PostController::class, 'storePostApi']);
// recent post
Route::get('/recentPosts', [PostController::class, 'recent']);


Route::get('/updatePostDataView', [PostController::class, 'viewUpdatePostData']);


// featured tag
Route::get('/tags/featured', [PostController::class, 'featuredTags']);
// get all data count statistics
Route::get('/statistics', [PostController::class, 'getStatistics']);

// comment panel
Route::prefix('comments')->group(function () {
    Route::post('/store', [CommentController::class, 'store']);
    Route::get('/{id}', [CommentController::class, 'show']);
    Route::delete('/{id}', [CommentController::class, 'destroy']);
});

// vote panel
Route::post('/vote', [VoteController::class, 'vote']);
Route::get('/vote-count/{post_id}', [VoteController::class, 'count']);
// post view panel
Route::post('/post/view', [PostViewController::class, 'store']);
Route::get('/post/views/{post_id}', [PostViewController::class, 'count']);
// book panel
Route::get('/data/active/books', [BookController::class, 'activeBooks']);


// Route::get('/books/testing', [PostController::class, 'testing']);

// Route::get('/messages/{receiverId}', [ChatController::class, 'fetchMessages']);
// Route::post('/messages/send', [ChatController::class, 'sendMessage']);

// routes for messaging

Route::post('/ably/auth', function (Request $request) {
    $userId = $request->input('user_id', 1); 
    $isAdmin = ($userId == 1);

    $ably = new AblyRest(config('ably.key'));

    $capabilities = $isAdmin
        ? ['chat:*' => ['publish', 'subscribe']]
        : ["chat:user_{$userId}" => ['publish', 'subscribe']];

    $tokenRequest = $ably->auth->requestToken([
        'capability' => $capabilities,
        'clientId' => $userId,
    ]);

    return response()->json($tokenRequest);
});

// Route to get messages for a specific user
Route::get('/chat/messages/{userId}', function ($userId) {
    // For the standalone user app, we'll pass the current user ID in the request
    // For the admin, we are using static user ID 1
    $currentUserId = request()->input('current_user_id', 1); // Default to admin (1) if not provided
    
    $messages = Message::where(function($query) use ($userId, $currentUserId) {
        $query->where('sender_id', $currentUserId)
              ->where('receiver_id', $userId);
    })->orWhere(function($query) use ($userId, $currentUserId) {
        $query->where('sender_id', $userId)
              ->where('receiver_id', $currentUserId);
    })->orderBy('created_at', 'asc')->get();
    
    return response()->json($messages);
});

// Route to send a message
Route::post('/chat/send', function (Request $request) {
    $request->validate([
        'message' => 'required|string',
        'receiver_id' => 'required|exists:users,id',
        'sender_id' => 'required|exists:users,id', // Now we require sender_id in the request
    ]);
    
    $message = Message::create([
        'sender_id' => $request->sender_id,
        'receiver_id' => $request->receiver_id,
        'message' => $request->message,
    ]);
    
    return response()->json($message);
});

// Route to get users (for admin panel)
Route::get('/users', function () {
    return User::where('is_admin', false)->get();
});


