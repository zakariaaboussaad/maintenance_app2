<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

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
     * Créer un nouvel utilisateur
     */
    public function store(Request $request)
    {
        try {
            // Validation des données
            $validator = Validator::make($request->all(), [
                'prenom' => 'required|string|max:255',
                'nom' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:6',
                'matricule' => 'nullable|string|max:255|unique:users,matricule',
                'numero_telephone' => 'nullable|string|max:20',
                'poste_affecte' => 'nullable|string|max:255',
                'role_id' => 'required|integer|in:1,2,3',
                'gender' => 'required|in:male,female'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Créer l'utilisateur
            $user = User::create([
                'prenom' => $request->prenom,
                'nom' => $request->nom,
                'name' => $request->prenom . ' ' . $request->nom,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'matricule' => $request->matricule,
                'numero_telephone' => $request->numero_telephone,
                'poste_affecte' => $request->poste_affecte,
                'role_id' => $request->role_id,
                'gender' => $request->gender,
                'is_active' => true,
                'date_embauche' => now()
            ]);

            // Charger les relations pour la réponse
            $user->load('role');

            return response()->json([
                'success' => true,
                'message' => 'Utilisateur créé avec succès',
                'data' => $user
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de l\'utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher un utilisateur spécifique
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

    /**
     * Mettre à jour un utilisateur
     */
    public function update(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);

            // Validation des données
            $validator = Validator::make($request->all(), [
                'prenom' => 'sometimes|required|string|max:255',
                'nom' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|email|unique:users,email,' . $id,
                'password' => 'nullable|string|min:6',
                'matricule' => 'nullable|string|max:255|unique:users,matricule,' . $id,
                'numero_telephone' => 'nullable|string|max:20',
                'poste_affecte' => 'nullable|string|max:255',
                'role_id' => 'sometimes|required|integer|in:1,2,3',
                'gender' => 'sometimes|required|in:male,female'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Mettre à jour les champs
            if ($request->has('prenom')) $user->prenom = $request->prenom;
            if ($request->has('nom')) $user->nom = $request->nom;
            if ($request->has('prenom') || $request->has('nom')) {
                $user->name = ($request->prenom ?? $user->prenom) . ' ' . ($request->nom ?? $user->nom);
            }
            if ($request->has('email')) $user->email = $request->email;
            if ($request->has('password') && $request->password !== '************') {
                $user->password = Hash::make($request->password);
            }
            if ($request->has('matricule')) $user->matricule = $request->matricule;
            if ($request->has('numero_telephone')) $user->numero_telephone = $request->numero_telephone;
            if ($request->has('poste_affecte')) $user->poste_affecte = $request->poste_affecte;
            if ($request->has('role_id')) $user->role_id = $request->role_id;
            if ($request->has('gender')) $user->gender = $request->gender;

            $user->save();

            // Recharger avec les relations
            $user->load('role');

            return response()->json([
                'success' => true,
                'message' => 'Utilisateur mis à jour avec succès',
                'data' => $user
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de l\'utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un utilisateur
     */
    public function destroy($id)
    {
        try {
            $user = User::findOrFail($id);

            // Vérifier si l'utilisateur peut être supprimé (par exemple, s'il n'a pas de tickets en cours)
            // Vous pouvez ajouter des vérifications métier ici

            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'Utilisateur supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
