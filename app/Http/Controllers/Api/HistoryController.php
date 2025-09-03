<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Equipement;
use App\Models\Ticket;
use App\Models\Panne;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HistoryController extends Controller
{
    /**
     * Get all users for history view (Admin only)
     */
    public function getUsersHistory(Request $request)
    {
        try {
            // Enhanced authentication logic (prioritize sanctum, fallback to token parsing)
            $user = Auth::guard('sanctum')->user();
            
            if (!$user) {
                // Fallback: try to parse bearer token directly
                $token = request()->bearerToken();
                if ($token) {
                    $personalAccessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
                    if ($personalAccessToken) {
                        $user = $personalAccessToken->tokenable;
                    }
                }
            }
            
            if (!$user || !$user->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $users = User::with(['role'])
                ->select([
                    'id_user',
                    'prenom',
                    'nom',
                    'email',
                    'role_id',
                    'matricule',
                    'numero_telephone',
                    'poste_affecte',
                    'is_active',
                    'created_at'
                ])
                ->withCount('tickets')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($user) {
                    return [
                        'id_user' => $user->id_user,
                        'full_name' => $user->full_name,
                        'email' => $user->email,
                        'role_id' => $user->role_id,
                        'role_name' => $user->role_name,
                        'matricule' => $user->matricule,
                        'numero_telephone' => $user->numero_telephone,
                        'poste_affecte' => $user->poste_affecte,
                        'is_active' => $user->is_active,
                        'tickets_count' => $user->tickets_count,
                        'created_at' => $user->created_at->format('Y-m-d H:i:s')
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $users
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des utilisateurs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all tickets created by a specific user
     */
    public function getUserTickets(Request $request, $userId)
    {
        try {
            // Enhanced authentication logic (prioritize sanctum, fallback to token parsing)
            $user = Auth::guard('sanctum')->user();
            
            if (!$user) {
                // Fallback: try to parse bearer token directly
                $token = request()->bearerToken();
                if ($token) {
                    $personalAccessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
                    if ($personalAccessToken) {
                        $user = $personalAccessToken->tokenable;
                    }
                }
            }
            
            if (!$user || !$user->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            // Get the user
            $targetUser = User::where('id_user', $userId)->first();
            if (!$targetUser) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            // Get all tickets created by this user
            $tickets = Ticket::with(['equipement', 'technicien', 'categorie'])
                ->where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($ticket) {
                    return [
                        'id' => $ticket->id,
                        'titre' => $ticket->titre,
                        'description' => $ticket->description,
                        'priorite' => $ticket->priorite,
                        'status' => $ticket->status,
                        'equipement' => $ticket->equipement ? [
                            'numero_serie' => $ticket->equipement->numero_serie,
                            'modele' => $ticket->equipement->modele,
                            'marque' => $ticket->equipement->marque,
                            'localisation' => $ticket->equipement->localisation
                        ] : null,
                        'technicien_assigne' => $ticket->technicien ? [
                            'id_user' => $ticket->technicien->id_user,
                            'full_name' => $ticket->technicien->full_name
                        ] : null,
                        'categorie' => $ticket->categorie ? $ticket->categorie->nom : null,
                        'date_creation' => $ticket->date_creation ? $ticket->date_creation->format('Y-m-d H:i:s') : null,
                        'created_at' => $ticket->created_at->format('Y-m-d H:i:s'),
                        'commentaire_resolution' => $ticket->commentaire_resolution
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => [
                        'id_user' => $targetUser->id_user,
                        'full_name' => $targetUser->full_name,
                        'email' => $targetUser->email,
                        'role_name' => $targetUser->role_name
                    ],
                    'tickets' => $tickets,
                    'total_tickets' => $tickets->count()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des tickets',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all equipment for history view (Admin only)
     */
    public function getEquipmentsHistory(Request $request)
    {
        try {
            // Enhanced authentication logic (prioritize sanctum, fallback to token parsing)
            $user = Auth::guard('sanctum')->user();
            
            if (!$user) {
                // Fallback: try to parse bearer token directly
                $token = request()->bearerToken();
                if ($token) {
                    $personalAccessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
                    if ($personalAccessToken) {
                        $user = $personalAccessToken->tokenable;
                    }
                }
            }
            
            if (!$user || !$user->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $equipments = Equipement::with(['typeEquipement', 'utilisateurAssigne'])
                ->withCount(['tickets', 'pannes'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($equipment) {
                    return [
                        'id_equipement' => $equipment->numero_serie,
                        'numero_serie' => $equipment->numero_serie,
                        'nom' => $equipment->modele . ' - ' . $equipment->marque,
                        'modele' => $equipment->modele,
                        'marque' => $equipment->marque,
                        'localisation' => $equipment->localisation,
                        'statut' => $equipment->status,
                        'type' => $equipment->typeEquipement ? $equipment->typeEquipement->nom_type : 'Non défini',
                        'utilisateur_assigne' => $equipment->utilisateurAssigne ? [
                            'id_user' => $equipment->utilisateurAssigne->id_user,
                            'full_name' => $equipment->utilisateurAssigne->full_name
                        ] : null,
                        'tickets_count' => $equipment->tickets_count,
                        'pannes_count' => $equipment->pannes_count,
                        'total_issues' => $equipment->tickets_count + $equipment->pannes_count,
                        'date_installation' => $equipment->date_installation ? $equipment->date_installation->format('Y-m-d') : null,
                        'created_at' => $equipment->created_at->format('Y-m-d H:i:s')
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $equipments
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
     * Get all tickets and pannes for a specific equipment
     */
    public function getEquipmentIssues(Request $request, $equipmentId)
    {
        try {
            // Enhanced authentication logic (prioritize sanctum, fallback to token parsing)
            $user = Auth::guard('sanctum')->user();
            
            if (!$user) {
                // Fallback: try to parse bearer token directly
                $token = request()->bearerToken();
                if ($token) {
                    $personalAccessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
                    if ($personalAccessToken) {
                        $user = $personalAccessToken->tokenable;
                    }
                }
            }
            
            if (!$user || !$user->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            // Get the equipment
            $equipment = Equipement::with(['typeEquipement', 'utilisateurAssigne'])->where('numero_serie', $equipmentId)->first();
            if (!$equipment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Équipement non trouvé'
                ], 404);
            }

            // Get all tickets for this equipment
            $tickets = Ticket::with(['user', 'technicien', 'categorie'])
                ->where('equipement_id', $equipment->numero_serie)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($ticket) {
                    return [
                        'id' => $ticket->id,
                        'type' => 'ticket',
                        'titre' => $ticket->titre,
                        'description' => $ticket->description,
                        'priorite' => $ticket->priorite,
                        'status' => $ticket->status,
                        'user' => $ticket->user ? [
                            'id_user' => $ticket->user->id_user,
                            'full_name' => $ticket->user->full_name
                        ] : null,
                        'technicien_assigne' => $ticket->technicien ? [
                            'id_user' => $ticket->technicien->id_user,
                            'full_name' => $ticket->technicien->full_name
                        ] : null,
                        'categorie' => $ticket->categorie ? $ticket->categorie->nom : null,
                        'date_creation' => $ticket->date_creation ? $ticket->date_creation->format('Y-m-d H:i:s') : null,
                        'created_at' => $ticket->created_at->format('Y-m-d H:i:s'),
                        'commentaire_resolution' => $ticket->commentaire_resolution
                    ];
                });

            // Get all pannes for this equipment
            $pannes = Panne::with(['user'])
                ->where('equipement_id', $equipment->numero_serie)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($panne) {
                    return [
                        'id' => $panne->id,
                        'type' => 'panne',
                        'titre' => $panne->description_probleme ?? 'Panne équipement',
                        'description' => $panne->description_probleme,
                        'priorite' => $panne->priorite ?? 'normale',
                        'status' => $panne->status,
                        'user' => $panne->user ? [
                            'id_user' => $panne->user->id_user,
                            'full_name' => $panne->user->full_name
                        ] : null,
                        'date_panne' => $panne->date_panne ? $panne->date_panne->format('Y-m-d H:i:s') : null,
                        'date_resolution' => $panne->date_resolution ? $panne->date_resolution->format('Y-m-d H:i:s') : null,
                        'created_at' => $panne->created_at->format('Y-m-d H:i:s'),
                        'commentaire_resolution' => $panne->commentaire_resolution ?? null
                    ];
                });

            // Combine and sort all issues by creation date
            $allIssues = $tickets->concat($pannes)->sortByDesc('created_at')->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'equipment' => [
                        'numero_serie' => $equipment->numero_serie,
                        'modele' => $equipment->modele,
                        'marque' => $equipment->marque,
                        'localisation' => $equipment->localisation,
                        'status' => $equipment->status,
                        'type_equipement' => $equipment->typeEquipement ? $equipment->typeEquipement->nom_type : null,
                        'utilisateur_assigne' => $equipment->utilisateurAssigne ? [
                            'id_user' => $equipment->utilisateurAssigne->id_user,
                            'full_name' => $equipment->utilisateurAssigne->full_name
                        ] : null
                    ],
                    'issues' => $allIssues,
                    'total_issues' => $allIssues->count(),
                    'tickets_count' => $tickets->count(),
                    'pannes_count' => $pannes->count()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des problèmes',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
