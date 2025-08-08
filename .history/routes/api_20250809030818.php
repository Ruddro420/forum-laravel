<?php

use App\Http\Controllers\BookController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\PostViewController;
use App\Http\Controllers\VoteController;
use App\Models\UserEntry;
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

// Ably auth for client SDK (stateless; accepts user_id param)
Route::post('/ably/auth', function (Request $request) {
    $userId = (int) $request->input('user_id');
    $isAdmin = $userId === 1;

    $user = UserEntry::find($userId);
    if (!$user) {
        return response()->json(['error' => 'User not found'], 404);
    }

    $ably = new AblyRest(config('ably.key'));

    $capabilities = $isAdmin
        ? ['chat:*' => ['publish', 'subscribe']]
        : ["chat:user_{$userId}" => ['publish', 'subscribe']];

    $tokenRequest = $ably->auth->requestToken([
        'capability' => $capabilities,
        'clientId' => (string) $userId,
    ]);

    return response()->json($tokenRequest);
});

// Get chat messages between two users
// Route::get('/chat/messages/{userId}', function ($userId) {
//     $currentUserId = (int) request()->input('current_user_id', 1);

//     $messages = Message::where(function($q) use ($userId, $currentUserId) {
//         $q->where('sender_id', $currentUserId)->where('receiver_id', $userId);
//     })->orWhere(function($q) use ($userId, $currentUserId) {
//         $q->where('sender_id', $userId)->where('receiver_id', $currentUserId);
//     })->orderBy('created_at','asc')->get();

//     // Attach sender_name dynamically based on user table
//     $messages->transform(function($msg) {
//         $sender = User::find($msg->sender_id) ?: UserEntry::find($msg->sender_id);
//         $msg->sender_name = $sender ? ($sender->name ?? ($sender->first_name . ' ' . $sender->last_name)) : 'Unknown';
//         return $msg;
//     });

//     return response()->json($messages);

// });


Route::get('/chat/messages/{userId}', function (Request $request, $userId) {
    // Get current_user_id from query param; no default fallback
    $currentUserId = (int) $request->input('current_user_id');

    if (!$currentUserId) {
        return response()->json(['error' => 'current_user_id parameter is required'], 400);
    }

    $messages = Message::where(function($q) use ($userId, $currentUserId) {
        $q->where('sender_id', $currentUserId)->where('receiver_id', $userId);
    })->orWhere(function($q) use ($userId, $currentUserId) {
        $q->where('sender_id', $userId)->where('receiver_id', $currentUserId);
    })->orderBy('created_at','asc')->get();

    // Attach sender_name dynamically based on user table
    $messages->transform(function($msg) {
        $sender = User::find($msg->sender_id) ?: UserEntry::find($msg->sender_id);
        $msg->sender_name = $sender ? ($sender->name ?? ($sender->first_name . ' ' . $sender->last_name)) : 'Unknown';
        return $msg;
    });

    return response()->json($messages);
});


// Send a message and publish it
Route::post('/chat/send', function (Request $request) {
    $data = $request->only(['message', 'receiver_id', 'sender_id']);

    $validator = Validator::make($data, [
        'message' => 'required|string',
        'receiver_id' => ['required', function($attribute, $value, $fail) {
            // Check if receiver_id exists in users OR user_entries table
            if (!User::where('id', $value)->exists() && !UserEntry::where('id', $value)->exists()) {
                $fail("The selected receiver id is invalid.");
            }
        }],
        'sender_id' => ['required', function($attribute, $value, $fail) {
            // Check if sender_id exists in users OR user_entries table
            if (!User::where('id', $value)->exists() && !UserEntry::where('id', $value)->exists()) {
                $fail("The selected sender id is invalid.");
            }
        }],
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    // Create message as usual
    $message = Message::create([
        'sender_id' => $data['sender_id'],
        'receiver_id' => $data['receiver_id'],
        'message' => $data['message'],
    ]);

    // Determine sender name based on sender_id table
    $senderUser = User::find($message->sender_id) ?: UserEntry::find($message->sender_id);
    $senderName = $senderUser ? ($senderUser->name ?? ($senderUser->first_name . ' ' . $senderUser->last_name)) : null;

    // Publish to receiver's channel
    $ably = new AblyRest(config('ably.key'));
    $channelName = "chat:user_{$message->receiver_id}";

    $payload = [
        'sender_id' => $message->sender_id,
        'receiver_id' => $message->receiver_id,
        'message' => $message->message,
        'sender_name' => $senderName,
        'timestamp' => $message->created_at->toDateTimeString(),
    ];

    $ably->channels->get($channelName)->publish('message', $payload);

    return response()->json($payload);
});

// List users for admin
Route::get('/users', function () {
    return UserEntry::select('id', 'first_name', 'last_name')->get();
});



