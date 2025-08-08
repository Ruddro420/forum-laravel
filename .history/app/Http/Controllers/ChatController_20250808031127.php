<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;
use App\Events\MessageSent;

class ChatController extends Controller
{
    public function fetchMessages($receiverId)
    {
        $senderId = 1; // your custom auth user id here

        if (!$senderId) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $messages = Message::where(function ($q) use ($senderId, $receiverId) {
            $q->where('sender_id', $senderId)->where('receiver_id', $receiverId);
        })->orWhere(function ($q) use ($senderId, $receiverId) {
            $q->where('sender_id', $receiverId)->where('receiver_id', $senderId);
        })->orderBy('created_at')->get();

        return response()->json($messages);
    }

    public function sendMessage(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'message' => 'required|string',
        ]);

        $senderId = 1; // your custom auth user id here

        if (!$senderId) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $message = Message::create([
            'sender_id' => $senderId,
            'receiver_id' => $request->receiver_id,
            'message' => $request->message,
        ]);

        broadcast(new MessageSent($message))->toOthers();

        return response()->json($message);
    }
}
