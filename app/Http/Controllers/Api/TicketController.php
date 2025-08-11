<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\Equipement;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    /**
     * Afficher tous les tickets
     */
    public function index()
    {
        try {
            $tickets = Ticket::with(['user', 'equipement.typeEquipement', 'technicien', 'categorie'])->get();

            return response()->json([
                'success' => true,
                'data' => $tickets,
                'count' => $tickets->count()
            ]);
        } catch (\Exception $t) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des tickets',
                'error' => $t->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher les tickets d'un utilisateur spécifique
     */
    public function getUserTickets($userId)
    {
        try {
            $tickets = Ticket::with([
                'user',
                'equipement.typeEquipement',
                'technicien',
                'categorie'
            ])->where('user_id', $userId)->get();

            return response()->json([
                'success' => true,
                'data' => $tickets,
                'count' => $tickets->count()
            ]);
        } catch (\Exception $t) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des tickets utilisateur',
                'error' => $t->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher un ticket spécifique
     */
    public function show($id)
    {
        try {
            $ticket = Ticket::with(['user', 'equipement.typeEquipement', 'technicien', 'categorie'])
                                  ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $ticket
            ]);
        } catch (\Exception $t) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket non trouvé',
                'error' => $t->getMessage()
            ], 404);
        }
    }

    /**
     * Créer un nouveau ticket
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'titre' => 'required|string|max:255',
                'description' => 'required|string',
                'priorite' => 'required|in:basse,normale,haute,critique',
                'categorie_id' => 'required|exists:categories,id',
                'equipement_id' => 'required|exists:equipements,numero_serie',
                'user_id' => 'required|exists:users,id_user',
                'commentaire' => 'nullable|string|max:500'
            ]);

            // Prevent creating a new ticket if there is already an open ticket for this equipment
            $alreadyOpen = Ticket::where('equipement_id', $request->equipement_id)
                ->whereIn('status', ['ouvert', 'en_attente', 'en_cours'])
                ->exists();

            if ($alreadyOpen) {
                return response()->json([
                    'success' => false,
                    'message' => 'Un ticket est déjà ouvert pour cet équipement. Veuillez attendre sa résolution.',
                ], 422);
            }

            $ticket = Ticket::create([
                'titre' => $request->titre,
                'description' => $request->description,
                'priorite' => $request->priorite,
                'categorie_id' => $request->categorie_id,
                'equipement_id' => $request->equipement_id,
                'user_id' => $request->user_id,
                // Business rule: new tickets start as "en_attente" until a technician takes them
                'status' => 'en_attente',
                'date_creation' => now(),
                'commentaire_resolution' => $request->commentaire
            ]);

            // Mettre l'équipement en maintenance lorsqu'un ticket est créé
            try {
                $equipement = Equipement::find($request->equipement_id);
                if ($equipement) {
                    $equipement->status = 'En maintenance';
                    $equipement->save();
                }
            } catch (\Exception $ignore) {
                // ne pas casser la création du ticket si la MAJ équipement échoue
            }

            return response()->json([
                'success' => true,
                'message' => 'Ticket créé avec succès',
                'data' => $ticket
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du ticket',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Vérifier si un ticket est assigné
     */
    public function checkAssignment($id)
    {
        try {
            $ticket = Ticket::with('technicien')->findOrFail($id);

            $isAssigned = !is_null($ticket->technicien_assigne);
            $assignedTechnician = null;

            if ($isAssigned && $ticket->technicien) {
                $assignedTechnician = $ticket->technicien->prenom . ' ' . $ticket->technicien->nom;
            }

            return response()->json([
                'success' => true,
                'isAssigned' => $isAssigned,
                'assignedTechnician' => $assignedTechnician
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la vérification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Assigner un ticket à un technicien
     */
    public function assign(Request $request, $id)
    {
        try {
            $request->validate([
                'technician_id' => 'required|integer|exists:users,id_user'
            ]);

            $ticket = Ticket::findOrFail($id);

            // Si déjà assigné au même technicien, ne rien changer
            if (!is_null($ticket->technicien_assigne) && (int)$ticket->technicien_assigne === (int)$request->technician_id) {
                return response()->json([
                    'success' => true,
                    'message' => 'Ticket déjà assigné à ce technicien'
                ]);
            }

            // Assigner ou réassigner le ticket
            $ticket->technicien_assigne = $request->technician_id;
            $ticket->date_assignation = now();
            // Mettre le status en "en_cours" lorsqu'un technicien prend le ticket
            if (in_array($ticket->status, ['ouvert', 'en_attente'])) {
                $ticket->status = 'en_cours';
            }
            $ticket->save();

            return response()->json([
                'success' => true,
                'message' => 'Ticket assigné avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'assignation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour un ticket (statut, commentaire, priorité, etc.)
     */
    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'status' => 'nullable|in:ouvert,en_attente,en_cours,resolu,ferme,annule',
                'priorite' => 'nullable|in:basse,normale,haute,critique',
                'commentaire_resolution' => 'nullable|string|max:500',
                'technicien_assigne' => 'nullable|integer|exists:users,id_user',
            ]);

            $ticket = Ticket::findOrFail($id);

            if ($request->has('status')) {
                $ticket->status = $request->status;

                if ($request->status === 'en_cours' && is_null($ticket->date_assignation)) {
                    $ticket->date_assignation = now();
                }
                if ($request->status === 'resolu') {
                    $ticket->date_resolution = now();
                }
                if ($request->status === 'ferme') {
                    $ticket->date_fermeture = now();
                }

                // Synchroniser le statut de l'équipement selon le statut du ticket
                try {
                    $equipement = Equipement::find($ticket->equipement_id);
                    if ($equipement) {
                        if (in_array($ticket->status, ['ouvert', 'en_attente', 'en_cours'])) {
                            $equipement->status = 'En maintenance';
                        } elseif (in_array($ticket->status, ['resolu', 'ferme', 'annule'])) {
                            $equipement->status = 'Actif';
                        }
                        $equipement->save();
                    }
                } catch (\Exception $ignore) {
                    // ignorer silencieusement
                }
            }

            if ($request->has('priorite')) {
                $ticket->priorite = $request->priorite;
            }

            if ($request->has('commentaire_resolution')) {
                $ticket->commentaire_resolution = $request->commentaire_resolution;
            }

            if ($request->has('technicien_assigne')) {
                $ticket->technicien_assigne = $request->technicien_assigne;
                if (is_null($ticket->date_assignation)) {
                    $ticket->date_assignation = now();
                }
            }

            $ticket->save();

            return response()->json([
                'success' => true,
                'message' => 'Ticket mis à jour avec succès',
                'data' => $ticket,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du ticket',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Afficher les tickets assignés à un technicien
     */
    public function getTechnicianTickets($technicianId)
    {
        try {
            $tickets = Ticket::with([
                'user',
                'equipement.typeEquipement',
                'technicien',
                'categorie'
            ])->where('technicien_assigne', $technicianId)->get();

            return response()->json([
                'success' => true,
                'data' => $tickets,
                'count' => $tickets->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des tickets du technicien',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
