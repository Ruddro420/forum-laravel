<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Events\MessageSent;

class ChatController extends Controller
{
    // Add middleware to ensure authentication
    public function __construct()
    {
        $this->middleware('auth:sanctum'); // Or 'auth' depending on your setup
    }

    public function fetchMessages($receiverId)
    {
        $userId = Auth::id();

        $messages = Message::where(function ($q) use ($userId, $receiverId) {
            $q->where('sender_id', $userId)->where('receiver_id', $receiverId);
        })->orWhere(function ($q) use ($userId, $receiverId) {
            $q->where('sender_id', $receiverId)->where('receiver_id', $userId);
        })->orderBy('created_at')->get();

        return response()->json($messages);
    }

    public function sendMessage(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'message' => 'required|string',
        ]);

        $senderId = Auth::id();
        if (!$senderId) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $message = Message::create([
            'sender_id' => $senderId,
            'receiver_id' => $request->receiver_id,
            'message' => $request->message,
        ]);

        // Broadcast event for real-time updates
        broadcast(new MessageSent($message))->toOthers();

        return response()->json($message);
    }
}
