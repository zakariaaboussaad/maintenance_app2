<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        try {
            // Step 1: Log the attempt with more details
            \Log::info('=== LOGIN ATTEMPT STARTED ===');
            \Log::info('Request method: ' . $request->method());
            \Log::info('Request URL: ' . $request->fullUrl());
            \Log::info('Request headers: ', $request->headers->all());
            \Log::info('Email: ' . $request->email);
            \Log::info('Password length: ' . strlen($request->password ?? ''));

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

            // Step 3: Check database connection
            try {
                $dbName = DB::connection()->getDatabaseName();
                \Log::info('Database connection successful: ' . $dbName);
            } catch (\Exception $dbError) {
                \Log::error('Database connection failed: ' . $dbError->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de connexion à la base de données'
                ], 500);
            }

            // Step 4: Try to find user with more debugging
            \Log::info('Looking for user with email: ' . $request->email);
            
            // First, let's see what users exist
            $allUsers = User::select('id_user', 'email', 'prenom', 'nom', 'role_id', 'is_active')->get();
            \Log::info('All users in database:', $allUsers->toArray());

            $user = User::where('email', $request->email)->first();

            if (!$user) {
                \Log::warning('User not found in database');
                
                // Let's also try case-insensitive search
                $userCaseInsensitive = User::whereRaw('LOWER(email) = ?', [strtolower($request->email)])->first();
                if ($userCaseInsensitive) {
                    \Log::info('Found user with case-insensitive search');
                    $user = $userCaseInsensitive;
                } else {
                    \Log::warning('User not found even with case-insensitive search');
                    return response()->json([
                        'success' => false,
                        'message' => 'Email ou mot de passe incorrect',
                        'debug' => 'User not found with email: ' . $request->email
                    ], 401);
                }
            }

            \Log::info('User found:', [
                'id_user' => $user->id_user,
                'email' => $user->email,
                'prenom' => $user->prenom,
                'nom' => $user->nom,
                'role_id' => $user->role_id,
                'is_active' => $user->is_active,
                'password_hash_length' => strlen($user->password)
            ]);

            // Step 5: Check if user is active
            if (!$user->is_active) {
                \Log::warning('User account is not active');
                return response()->json([
                    'success' => false,
                    'message' => 'Compte désactivé'
                ], 401);
            }

            // Step 6: Verify password with detailed logging
            \Log::info('Checking password...');
            \Log::info('Provided password: ' . $request->password);
            \Log::info('Stored hash starts with: ' . substr($user->password, 0, 10) . '...');
            
            $passwordCheck = Hash::check($request->password, $user->password);
            \Log::info('Password check result: ' . ($passwordCheck ? 'SUCCESS' : 'FAILED'));

            if (!$passwordCheck) {
                \Log::warning('Password verification failed');
                
                // Let's try to create a new hash for comparison
                $newHash = Hash::make($request->password);
                \Log::info('New hash for same password: ' . substr($newHash, 0, 10) . '...');
                
                return response()->json([
                    'success' => false,
                    'message' => 'Email ou mot de passe incorrect',
                    'debug' => 'Password verification failed'
                ], 401);
            }

            \Log::info('Password verified successfully');

            // Step 7: Create token - simplified approach
            $token = null;
            try {
                \Log::info('Attempting to create token for user: ' . $user->id_user);
                
                // Direct token creation
                $tokenResult = $user->createToken('maintenance-app-token');
                $token = $tokenResult->plainTextToken;
                
                \Log::info('Token created successfully', [
                    'user_id' => $user->id_user,
                    'token_length' => strlen($token)
                ]);
                
            } catch (\Exception $tokenError) {
                \Log::error('Token creation failed: ' . $tokenError->getMessage());
                
                // Return error response instead of continuing
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur lors de la création du token d\'authentification',
                    'error' => 'Token creation failed: ' . $tokenError->getMessage(),
                    'debug' => [
                        'user_id' => $user->id_user,
                        'user_email' => $user->email,
                        'sanctum_available' => class_exists('Laravel\Sanctum\HasApiTokens'),
                        'create_token_method' => method_exists($user, 'createToken')
                    ]
                ], 500);
            }

            // Step 8: Prepare response
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
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString()
                ] : null
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            if ($request->user() && $request->user()->currentAccessToken()) {
                $request->user()->currentAccessToken()->delete();
            }
            return response()->json([
                'success' => true,
                'message' => 'Déconnexion réussie'
            ]);
        } catch (\Exception $e) {
            \Log::error('Logout error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la déconnexion',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function me(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non authentifié'
                ], 401);
            }

            return response()->json([
                'success' => true,
                'user' => [
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
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Me endpoint error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des données utilisateur'
            ], 500);
        }
    }
}