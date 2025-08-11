<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        try {
            // Step 1: Log the attempt
            \Log::info('=== LOGIN ATTEMPT STARTED ===');
            \Log::info('Email: ' . $request->email);

            // Step 2: Validate input
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required|min:6',
            ]);

            if ($validator->fails()) {
                \Log::error('Validation failed', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Step 3: Try to find user
            \Log::info('Looking for user with email: ' . $request->email);
            $user = User::where('email', $request->email)->first();

            if (!$user) {
                \Log::warning('User not found in database');
                return response()->json([
                    'success' => false,
                    'message' => 'Email ou mot de passe incorrect'
                ], 401);
            }

            \Log::info('User found:', [
                'id_user' => $user->id_user,
                'email' => $user->email,
                'prenom' => $user->prenom,
                'nom' => $user->nom,
                'role_id' => $user->role_id,
                'is_active' => $user->is_active
            ]);

            // Step 4: Check if user is active
            if (!$user->is_active) {
                \Log::warning('User account is not active');
                return response()->json([
                    'success' => false,
                    'message' => 'Compte désactivé'
                ], 401);
            }

            // Step 5: Verify password
            \Log::info('Checking password...');
            if (!Hash::check($request->password, $user->password)) {
                \Log::warning('Password verification failed');
                return response()->json([
                    'success' => false,
                    'message' => 'Email ou mot de passe incorrect'
                ], 401);
            }

            \Log::info('Password verified successfully');

            // Step 6: Create token (optional, skip if causing issues)
            $token = null;
            try {
                $token = $user->createToken('auth-token')->plainTextToken;
                \Log::info('Token created successfully');
            } catch (\Exception $tokenError) {
                \Log::warning('Token creation failed: ' . $tokenError->getMessage());
                // Continue without token
            }

            // Step 7: Prepare response
            $userData = [
                'id' => $user->id_user,
                'name' => trim(($user->prenom ?? '') . ' ' . ($user->nom ?? '')),
                'prenom' => $user->prenom,
                'nom' => $user->nom,
                'email' => $user->email,
                'role_id' => (int) $user->role_id,
                'matricule' => $user->matricule,
                'poste_affecte' => $user->poste_affecte,
                'numero_telephone' => $user->numero_telephone,
                'is_active' => (bool) $user->is_active,
            ];

            \Log::info('Login successful. Returning user data:', $userData);

            return response()->json([
                'success' => true,
                'message' => 'Connexion réussie',
                'user' => $userData,
                'token' => $token,
            ], 200);

        } catch (\Exception $e) {
            \Log::error('=== LOGIN ERROR ===');
            \Log::error('Error message: ' . $e->getMessage());
            \Log::error('File: ' . $e->getFile());
            \Log::error('Line: ' . $e->getLine());
            \Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Erreur serveur lors de la connexion',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
                'debug_info' => config('app.debug') ? [
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ] : null
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();
            return response()->json([
                'success' => true,
                'message' => 'Déconnexion réussie'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la déconnexion'
            ], 500);
        }
    }
}
