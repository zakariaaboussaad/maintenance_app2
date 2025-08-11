<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\user;
use Illuminate\Http\Request;

class UsersController extends Controller
{
    /**
     * Afficher tous les Utilisateurs
     */
    public function index()
    {
        try {
            $user = User::with('role')->get();

            return response()->json([
                'success' => true,
                'data' => $user,
                'count' => $user->count()
            ]);
        } catch (\Exception $u) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des utilisateur',
                'error' => $u->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher un équipement spécifique
     */
    public function show($id)
    {
        try {
            $user = User::with(['role'])
                                  ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $user
            ]);
        } catch (\Exception $u) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé',
                'error' => $u->getMessage()
            ], 404);
        }
    }
}
