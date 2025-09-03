<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = auth('sanctum')->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Non authentifié'
            ], 401);
        }
        
        if ($user->role_id !== 1) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé - Admin requis'
            ], 403);
        }
        
        return $next($request);
    }
}
