<?php

// app/Http/Controllers/ChatController.php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $apiKey = env('TAWK_API_KEY');
        $hash = hash_hmac('sha256', $user->email, $apiKey);

        return Inertia::render('ChatBox', [
            'visitor' => [
                'userId' => (string) $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'hash' => $hash,
            ]
        ]);
    }
}
