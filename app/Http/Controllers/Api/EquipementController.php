<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Equipement;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EquipementController extends Controller
{
    /**
     * Afficher tous les équipements
     */
    public function index()
    {
        try {
            $equipements = Equipement::with(['typeEquipement', 'utilisateurAssigne'])->get();

            return response()->json([
                'success' => true,
                'data' => $equipements,
                'count' => $equipements->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des équipements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher les équipements assignés à un utilisateur spécifique
     */
    public function getUserEquipements($userId)
    {
        try {
            $equipements = Equipement::with(['typeEquipement', 'utilisateurAssigne'])
                ->where('utilisateur_assigne', $userId)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $equipements,
                'count' => $equipements->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des équipements utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher un équipement spécifique
     */
    public function show($id)
    {
        try {
            $equipement = Equipement::with(['typeEquipement', 'utilisateurAssigne'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $equipement
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Équipement non trouvé',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Mettre à jour un équipement
     */
    public function update(Request $request, $id)
    {
        try {
            // Validation des données - FIXED: Changed 'id' to 'id_type' for type_equipements table
            $validator = Validator::make($request->all(), [
                'utilisateur_assigne' => 'nullable|integer|exists:users,id_user',
                'modele' => 'sometimes|string|max:255',
                'marque' => 'sometimes|string|max:255',
                'status' => 'sometimes|string|in:Actif,En maintenance,En veille',
                'localisation' => 'sometimes|nullable|string|max:255',
                'os' => 'sometimes|nullable|string|max:255',
                'prix_achat' => 'sometimes|nullable|numeric|min:0',
                'date_installation' => 'sometimes|nullable|date',
                'type_equipement_id' => 'sometimes|integer|exists:type_equipements,id_type' // FIXED: Changed from 'id' to 'id_type'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données de validation invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Trouver l'équipement
            $equipement = Equipement::where('numero_serie', $id)->first();

            if (!$equipement) {
                return response()->json([
                    'success' => false,
                    'message' => 'Équipement non trouvé'
                ], 404);
            }

            // Si on met à jour l'utilisateur assigné, vérifier qu'il existe et qu'il est actif
            if ($request->has('utilisateur_assigne') && $request->utilisateur_assigne) {
                $user = User::where('id_user', $request->utilisateur_assigne)
                           ->where('is_active', true)
                           ->first();

                if (!$user) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Utilisateur non trouvé ou inactif'
                    ], 404);
                }

                // Log pour debug
                \Log::info('Reassigning equipment', [
                    'equipment_id' => $id,
                    'old_user' => $equipement->utilisateur_assigne,
                    'new_user' => $request->utilisateur_assigne,
                    'user_found' => $user->toArray()
                ]);
            }

            // Préparer les données à mettre à jour
            $updateData = [];

            // Champs requis pour l'édition
            if ($request->has('modele')) {
                $updateData['modele'] = $request->modele;
            }
            if ($request->has('marque')) {
                $updateData['marque'] = $request->marque;
            }
            if ($request->has('status')) {
                $updateData['status'] = $request->status;
            }
            if ($request->has('localisation')) {
                $updateData['localisation'] = $request->localisation;
            }
            if ($request->has('os')) {
                $updateData['os'] = $request->os;
            }
            if ($request->has('prix_achat')) {
                $updateData['prix_achat'] = $request->prix_achat;
            }
            if ($request->has('date_installation')) {
                $updateData['date_installation'] = $request->date_installation;
            }
            if ($request->has('utilisateur_assigne')) {
                $updateData['utilisateur_assigne'] = $request->utilisateur_assigne;
            }
            if ($request->has('type_equipement_id')) {
                $updateData['type_equipement_id'] = $request->type_equipement_id;
            }

            // Mettre à jour l'équipement
            $equipement->update($updateData);

            // Recharger l'équipement avec ses relations
            $equipement->load(['typeEquipement', 'utilisateurAssigne']);

            return response()->json([
                'success' => true,
                'message' => 'Équipement mis à jour avec succès',
                'data' => $equipement
            ]);

        } catch (\Exception $e) {
            \Log::error('Equipment update error: ' . $e->getMessage(), [
                'equipment_id' => $id,
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de l\'équipement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer un nouvel équipement
     */
    public function store(Request $request)
    {
        \Log::info('Creating new equipment', [
            'request_data' => $request->all(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        try {
            // FIXED: Changed 'exists:type_equipements,id' to 'exists:type_equipements,id_type'
            $validator = Validator::make($request->all(), [
                'numero_serie' => 'required|string|unique:equipements,numero_serie|max:255',
                'modele' => 'required|string|max:255',
                'marque' => 'required|string|max:255',
                'type_equipement_id' => 'required|integer|exists:type_equipements,id_type', // FIXED: Changed from 'id' to 'id_type'
                'status' => 'required|string|in:Actif,En maintenance,En veille',
                'localisation' => 'nullable|string|max:255',
                'utilisateur_assigne' => 'nullable|integer|exists:users,id_user',
                'os' => 'nullable|string|max:255',
                'prix_achat' => 'nullable|numeric|min:0',
                'date_installation' => 'nullable|date',
                'date_garantie' => 'nullable|date'
            ]);

            if ($validator->fails()) {
                \Log::warning('Validation failed', ['errors' => $validator->errors()]);
                return response()->json([
                    'success' => false,
                    'message' => 'Données de validation invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Log before creating to see the final data
            $equipmentData = $request->all();
            \Log::debug('Attempting to create equipment', $equipmentData);

            // Manually create the equipment to catch any database errors
            $equipement = new Equipement();
            $equipement->fill($equipmentData);

            // Save and catch any database exceptions
            if (!$equipement->save()) {
                throw new \Exception('Failed to save equipment to database');
            }

            $equipement->load(['typeEquipement', 'utilisateurAssigne']);

            \Log::info('Equipment created successfully', ['id' => $equipement->numero_serie]);

            return response()->json([
                'success' => true,
                'message' => 'Équipement créé avec succès',
                'data' => $equipement
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Error creating equipment', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);

            $errorMessage = 'Erreur lors de la création de l\'équipement';

            // Check for database errors
            if ($e instanceof \Illuminate\Database\QueryException) {
                $errorMessage = 'Erreur de base de données: ' . $e->getMessage();
            }

            return response()->json([
                'success' => false,
                'message' => $errorMessage,
                'error' => config('app.debug') ? $e->getMessage() : null,
                'trace' => config('app.debug') ? $e->getTraceAsString() : null
            ], 500);
        }
    }

    /**
     * Supprimer un équipement
     */
    public function destroy($id)
    {
        try {
            $equipement = Equipement::where('numero_serie', $id)->first();

            if (!$equipement) {
                return response()->json([
                    'success' => false,
                    'message' => 'Équipement non trouvé'
                ], 404);
            }

            // Vérifier s'il y a des tickets associés à cet équipement
            $ticketsCount = \DB::table('tickets')->where('equipement_id', $id)->count();

            if ($ticketsCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de supprimer cet équipement car il est associé à des tickets existants. Veuillez d\'abord supprimer ou modifier ces tickets.'
                ], 400);
            }

            // Log avant suppression pour audit
            \Log::info('Deleting equipment', [
                'equipment_id' => $id,
                'equipment_data' => $equipement->toArray(),
                'deleted_by' => auth()->id() ?? 'unknown'
            ]);

            $equipement->delete();

            return response()->json([
                'success' => true,
                'message' => 'Équipement supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            \Log::error('Equipment deletion error: ' . $e->getMessage(), [
                'equipment_id' => $id,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'équipement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir les statistiques des équipements
     */
    public function getStats()
    {
        try {
            $stats = [
                'total' => Equipement::count(),
                'actifs' => Equipement::where('status', 'Actif')->count(),
                'en_maintenance' => Equipement::where('status', 'En maintenance')->count(),
                'en_veille' => Equipement::where('status', 'En veille')->count(),
                'assignes' => Equipement::whereNotNull('utilisateur_assigne')->count(),
                'non_assignes' => Equipement::whereNull('utilisateur_assigne')->count()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
