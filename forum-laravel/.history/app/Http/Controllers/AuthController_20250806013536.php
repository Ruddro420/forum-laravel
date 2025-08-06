<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\UserEntry;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // Check email and status == 1
        $user = UserEntry::where('email', $request->email)
            ->where('status', 1 || 'status', 'active')
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // You can set a basic session manually
        session(['user_id' => $user->id]);

        return response()->json([
            'message' => 'Login successful',
            'user' => $user
        ]);
    }

    public function logout(Request $request)
    {
        session()->forget('user_id');
        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request)
    {
        $user = UserEntry::find(session('user_id'), ['*']);

        if (!$user) {
            return response()->json(['message' => 'Not logged in'], 401);
        }

        return response()->json($user);
    }
}
