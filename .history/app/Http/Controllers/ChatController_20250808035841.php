<?php

// app/Http/Controllers/ChatController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user(); // Authenticated user

        // Your Tawk.to API key from .env (set TAWK_API_KEY)
        $apiKey = env('TAWK_API_KEY');

        // Generate secure hash for visitor authentication
        $hash = hash_hmac('sha256', $user->email, $apiKey);

        $visitor = [
            'userId' => (string) $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'hash' => $hash,
        ];

        // Render Inertia view and pass visitor data
        return Inertia::render('ChatBox', [
            'visitor' => $visitor,
        ]);
    }
}
