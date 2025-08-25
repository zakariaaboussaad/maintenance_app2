<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class TestExportController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function testAuth(Request $request)
    {
        $user = auth('sanctum')->user();
        
        return response()->json([
            'success' => true,
            'user' => $user,
            'user_id' => $user ? $user->id_user : null,
            'role_id' => $user ? $user->role_id : null,
            'is_admin' => $user ? ($user->role_id === 1) : false,
            'message' => 'Auth test successful'
        ]);
    }

    public function testSimpleExport(Request $request)
    {
        $user = auth('sanctum')->user();
        
        if (!$user || $user->role_id !== 1) {
            return response()->json(['error' => 'Unauthorized', 'user' => $user, 'role_id' => $user ? $user->role_id : null], 403);
        }

        $users = User::take(5)->get(['id_user', 'nom', 'prenom', 'email']);
        
        return response()->json([
            'success' => true,
            'message' => 'Test export successful',
            'data' => $users,
            'count' => $users->count()
        ]);
    }
}
