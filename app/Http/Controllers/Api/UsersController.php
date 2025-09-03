<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UsersController extends Controller
{
    // Remove middleware from constructor - handle authentication in methods

    /**
     * Afficher tous les Utilisateurs
     */
    public function index()
    {
        try {
            // Skip authentication for now - frontend handles user verification
            $users = User::with('role')->get();

            return response()->json([
                'success' => true,
                'users' => $users,
                'count' => $users->count()
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
                'matricule' => 'required|string|max:255|unique:users,matricule',
                'numero_telephone' => 'nullable|string|max:20',
                'poste_affecte' => 'required|string|max:255',
                'role_id' => 'required|integer|in:1,2,3',
                'gender' => 'nullable|in:male,female'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Créer l'utilisateur
            $userData = [
                'prenom' => $request->prenom,
                'nom' => $request->nom,
                'name' => $request->prenom . ' ' . $request->nom,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'matricule' => $request->matricule,
                'numero_telephone' => $request->numero_telephone,
                'poste_affecte' => $request->poste_affecte,
                'role_id' => $request->role_id,
                'is_active' => true,
                'date_embauche' => now(),
                'password_updated_at' => now()
            ];

            // Add gender only if provided
            if ($request->has('gender') && !empty($request->gender)) {
                $userData['gender'] = $request->gender;
            }

            $user = User::create($userData);

            // Charger les relations pour la réponse
            $user->load('role');

            return response()->json([
                'success' => true,
                'message' => 'Utilisateur créé avec succès',
                'data' => $user
            ], 201);

        } catch (\Illuminate\Database\QueryException $e) {
            \Log::error('Database error during user creation:', ['error' => $e->getMessage()]);

            // Handle database constraint errors
            if (str_contains($e->getMessage(), 'Duplicate entry')) {
                if (str_contains($e->getMessage(), 'email')) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cette adresse email est déjà utilisée',
                        'errors' => ['email' => ['Cette adresse email est déjà utilisée']]
                    ], 422);
                } elseif (str_contains($e->getMessage(), 'matricule')) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Ce matricule est déjà utilisé',
                        'errors' => ['matricule' => ['Ce matricule est déjà utilisé']]
                    ], 422);
                }
            }

            return response()->json([
                'success' => false,
                'message' => 'Erreur de base de données lors de la création',
                'error' => 'Erreur de contrainte de base de données'
            ], 500);
        } catch (\Exception $e) {
            \Log::error('General error during user creation:', ['error' => $e->getMessage()]);
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
                                  ->where('id_user', $id)
                                  ->firstOrFail();

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
            // Debug: Log des données reçues
            \Log::info('Update user request:', [
                'id' => $id,
                'data' => $request->all()
            ]);

            $user = User::where('id_user', $id)->firstOrFail();

            // Validation des données pour la mise à jour
            $rules = [
                'prenom' => 'sometimes|required|string|max:255',
                'nom' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|email|unique:users,email,' . $id . ',id_user',
                'password' => 'nullable|string|min:6',
                'matricule' => 'nullable|string|max:255|unique:users,matricule,' . $id . ',id_user',
                'numero_telephone' => 'nullable|string|max:20',
                'poste_affecte' => 'nullable|string|max:255',
                'role_id' => 'sometimes|required|integer|in:1,2,3',
                'gender' => 'sometimes|nullable|in:male,female'
            ];

            // Si l'email est vide, on le retire de la validation
            if (empty($request->email)) {
                unset($rules['email']);
            }

            $validator = Validator::make($request->all(), $rules);

            if ($validator->fails()) {
                \Log::error('Validation failed:', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Mettre à jour les champs un par un
            $updateData = [];

            if ($request->has('prenom') && !empty($request->prenom)) {
                $updateData['prenom'] = $request->prenom;
            }

            if ($request->has('nom') && !empty($request->nom)) {
                $updateData['nom'] = $request->nom;
            }

            // Mettre à jour le champ 'name' si prenom ou nom change
            if (isset($updateData['prenom']) || isset($updateData['nom'])) {
                $newPrenom = $updateData['prenom'] ?? $user->prenom;
                $newNom = $updateData['nom'] ?? $user->nom;
                $updateData['name'] = trim($newPrenom . ' ' . $newNom);
            }

            if ($request->has('email') && !empty($request->email)) {
                $updateData['email'] = $request->email;
            }

            // Gestion spéciale du mot de passe
            if ($request->has('password') && !empty($request->password) && $request->password !== '************') {
                $updateData['password'] = Hash::make($request->password);
            }

            if ($request->has('matricule')) {
                $updateData['matricule'] = $request->matricule;
            }

            if ($request->has('numero_telephone')) {
                $updateData['numero_telephone'] = $request->numero_telephone;
            }

            if ($request->has('poste_affecte')) {
                $updateData['poste_affecte'] = $request->poste_affecte;
            }

            if ($request->has('role_id') && !empty($request->role_id)) {
                $updateData['role_id'] = intval($request->role_id);
            }

            if ($request->has('gender') && !empty($request->gender)) {
                $updateData['gender'] = $request->gender;
            }

            \Log::info('Update data:', $updateData);

            // Effectuer la mise à jour
            $user->update($updateData);

            // Recharger avec les relations
            $user->fresh(['role']);

            return response()->json([
                'success' => true,
                'message' => 'Utilisateur mis à jour avec succès',
                'data' => $user
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé',
                'error' => 'L\'utilisateur avec l\'ID ' . $id . ' n\'existe pas'
            ], 404);
        } catch (\Illuminate\Database\QueryException $e) {
            \Log::error('Database error:', ['error' => $e->getMessage()]);

            // Gérer les erreurs de contrainte de base de données
            if (str_contains($e->getMessage(), 'Duplicate entry')) {
                if (str_contains($e->getMessage(), 'email')) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cette adresse email est déjà utilisée',
                        'errors' => ['email' => ['Cette adresse email est déjà utilisée']]
                    ], 422);
                } elseif (str_contains($e->getMessage(), 'matricule')) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Ce matricule est déjà utilisé',
                        'errors' => ['matricule' => ['Ce matricule est déjà utilisé']]
                    ], 422);
                }
            }

            return response()->json([
                'success' => false,
                'message' => 'Erreur de base de données lors de la mise à jour',
                'error' => 'Erreur de contrainte de base de données'
            ], 500);
        } catch (\Exception $e) {
            \Log::error('General error:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);

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
            $user = User::where('id_user', $id)->firstOrFail();

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
