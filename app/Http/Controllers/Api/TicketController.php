<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\Equipement;
use App\Models\User;
use App\Services\NotificationService;
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

            // Load the ticket with user relationship for notifications
            $ticket->load('user');

            // Notify admins about new ticket
            NotificationService::notifyNewTicketCreated($ticket);

           
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

            // Get the old status for notification
            $oldStatus = $ticket->status;
            $oldTechnicianId = $ticket->technicien_assigne;
            
            // Assign or reassign the ticket
            $ticket->technicien_assigne = $request->technician_id;
            $ticket->date_assignation = now();
            
            // Set status to "en_cours" when a technician takes the ticket
            if (in_array($ticket->status, ['ouvert', 'en_attente'])) {
                $ticket->status = 'en_cours';
            }
            
            $ticket->save();
            
            // Get the assigned user and the user who made the assignment
            $assignedBy = auth('sanctum')->user();
            if (!$assignedBy) {
                $assignedBy = auth()->user();
            }
            if (!$assignedBy && $request->bearerToken()) {
                $token = $request->bearerToken();
                $personalAccessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
                if ($personalAccessToken) {
                    $assignedBy = $personalAccessToken->tokenable;
                }
            }
            if (!$assignedBy && $request->has('user_id')) {
                $assignedBy = User::find($request->user_id);
            }
            
            $assignedTo = User::find($request->technician_id);
            
            // Load ticket with user relationship for notifications
            $ticket->load('user');
            
            // Send notification about the assignment
            if ($assignedBy && $assignedTo) {
                \Log::info('=== TICKET ASSIGNMENT NOTIFICATIONS ===');
                \Log::info('Assigned by: ' . $assignedBy->id_user . ' (' . $assignedBy->email . ')');
                \Log::info('Assigned to: ' . $assignedTo->id_user . ' (' . $assignedTo->email . ')');
                \Log::info('Ticket ID: ' . $ticket->id_ticket);
                \Log::info('Ticket creator: ' . $ticket->user_id);
                \Log::info('Old technician: ' . $oldTechnicianId);
                \Log::info('New technician: ' . $request->technician_id);
                \Log::info('Old status: ' . $oldStatus . ', New status: ' . $ticket->status);
                
                // 1. Notify technician about assignment
                $result1 = NotificationService::notifyTicketAssigned($ticket, $assignedTo, $assignedBy);
                \Log::info('Ticket assigned notification result: ' . ($result1 ? 'success' : 'failed'));
                
                // 2. Always notify ticket creator about assignment/reassignment (unless they are the technician)
                if ($ticket->user_id && $ticket->user_id != $assignedTo->id_user) {
                    if ($oldTechnicianId && $oldTechnicianId != $request->technician_id) {
                        // This is a reassignment - notify about reassignment
                        \Log::info('REASSIGNMENT DETECTED: Notifying ticket creator (user_id: ' . $ticket->user_id . ') about reassignment');
                        \Log::info('Old technician ID: ' . $oldTechnicianId . ', New technician ID: ' . $request->technician_id);
                        
                        $oldTech = User::find($oldTechnicianId);
                        $oldTechName = $oldTech ? $oldTech->nom . ' ' . $oldTech->prenom : 'Technicien précédent';
                        
                        // Create custom reassignment notification
                        $titre = "Votre ticket a été réassigné";
                        $message = "Votre ticket #{$ticket->id}: {$ticket->titre} a été réassigné de {$oldTechName} à {$assignedTo->nom} {$assignedTo->prenom}";
                        
                        $data = [
                            'ticket_id' => $ticket->id,
                            'old_technician_id' => $oldTechnicianId,
                            'old_technician_name' => $oldTechName,
                            'new_technician_id' => $assignedTo->id_user,
                            'new_technician_name' => $assignedTo->nom . ' ' . $assignedTo->prenom,
                            'ticket_title' => $ticket->titre,
                            'action' => 'ticket_reassigned'
                        ];

                        \Log::info('Creating reassignment notification with data: ' . json_encode($data));

                        $result2 = \App\Models\Notification::create([
                            'user_id' => $ticket->user_id,
                            'type' => \App\Models\Notification::TYPE_TICKET_ASSIGNED,
                            'titre' => $titre,
                            'message' => $message,
                            'data' => json_encode($data),
                            'ticket_id' => $ticket->id,
                            'date_creation' => now(),
                            'lu' => false,
                        ]);
                        \Log::info('Ticket reassignment notification result: ' . ($result2 ? 'success with ID ' . ($result2->id ?? 'unknown') : 'FAILED'));
                        
                        if (!$result2) {
                            \Log::error('FAILED to create reassignment notification for user ' . $ticket->user_id);
                        }
                    } else {
                        // This is initial assignment
                        \Log::info('Notifying ticket creator (user_id: ' . $ticket->user_id . ') about initial assignment');
                        $result2 = NotificationService::notifyTicketTaken($ticket, $assignedTo);
                        \Log::info('Ticket creator notification result: ' . ($result2 ? 'success' : 'failed'));
                    }
                } else {
                    \Log::info('Skipping ticket creator notification - creator is the assigned technician');
                }
                
                // 3. If status changed, notify ticket creator about status update (unless they made the change)
                if ($oldStatus !== $ticket->status && $ticket->user_id && $ticket->user_id != $assignedBy->id_user) {
                    \Log::info('Notifying ticket creator about status change from ' . $oldStatus . ' to ' . $ticket->status);
                    $result3 = NotificationService::notifyTicketStatusChange($ticket, $oldStatus, $ticket->status, $assignedBy);
                    \Log::info('Status change notification result: ' . ($result3 ? 'success' : 'failed'));
                } else {
                    \Log::info('Skipping status change notification - no status change or creator made the change');
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Ticket assigné avec succès',
                'data' => $ticket
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
                'comment' => 'nullable|string', // For new comments
            ]);

            // Load ticket with relationships
            $ticket = Ticket::with(['user', 'technicien'])->findOrFail($id);
            $oldStatus = $ticket->status;
            $oldTechnicianId = $ticket->technicien_assigne;
            
            // Get the user making the update - try multiple methods
            $updatedBy = auth('sanctum')->user();
            if (!$updatedBy) {
                $updatedBy = auth()->user();
            }
            if (!$updatedBy && $request->has('user_id')) {
                $updatedBy = User::find($request->user_id);
            }
            
            // If still no user found, try to get from the Authorization header
            if (!$updatedBy && $request->bearerToken()) {
                $token = $request->bearerToken();
                $personalAccessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
                if ($personalAccessToken) {
                    $updatedBy = $personalAccessToken->tokenable;
                }
            }
            
            \Log::info('=== TICKET UPDATE DEBUG ===');
            \Log::info('Ticket ID: ' . $id);
            \Log::info('Old status: ' . $oldStatus);
            \Log::info('New status: ' . ($request->status ?? 'no change'));
            \Log::info('Updated by: ' . ($updatedBy ? $updatedBy->email . ' (ID: ' . $updatedBy->id_user . ')' : 'null'));
            \Log::info('Ticket user_id: ' . $ticket->user_id);
            \Log::info('Request has comment: ' . ($request->has('comment') ? 'YES' : 'NO'));
            \Log::info('Comment value: ' . ($request->comment ?? 'null'));
            \Log::info('Request has commentaire_resolution: ' . ($request->has('commentaire_resolution') ? 'YES' : 'NO'));
            \Log::info('Commentaire_resolution value: ' . ($request->commentaire_resolution ?? 'null'));
            \Log::info('Old resolution comment: ' . ($ticket->commentaire_resolution ?? 'null'));
            \Log::info('Full request data: ' . json_encode($request->all()));
            
            // Additional debugging for user comparison
            if ($updatedBy && $ticket->user_id) {
                \Log::info('USER COMPARISON DEBUG:');
                \Log::info('Ticket creator ID: ' . $ticket->user_id . ' (type: ' . gettype($ticket->user_id) . ')');
                \Log::info('Updated by ID: ' . $updatedBy->id_user . ' (type: ' . gettype($updatedBy->id_user) . ')');
                \Log::info('Are they equal? ' . ($ticket->user_id == $updatedBy->id_user ? 'YES' : 'NO'));
                \Log::info('Are they identical? ' . ($ticket->user_id === $updatedBy->id_user ? 'YES' : 'NO'));
            }
            
            $statusChanged = false;
            $technicianChanged = false;

            // Handle status changes
            if ($request->has('status') && $request->status !== $ticket->status) {
                \Log::info('Status change detected: ' . $ticket->status . ' -> ' . $request->status);
                $ticket->status = $request->status;
                $statusChanged = true;

                if ($request->status === 'en_cours' && is_null($ticket->date_assignation)) {
                    $ticket->date_assignation = now();
                }
                if ($request->status === 'resolu') {
                    $ticket->date_resolution = now();
                }
                if ($request->status === 'ferme') {
                    $ticket->date_fermeture = now();
                }
            }

            // Update other fields if provided
            if ($request->has('priorite')) {
                $ticket->priorite = $request->priorite;
            }
            
            // Handle comment addition - check for new comments vs existing resolution updates
            // IMPORTANT: Get old values BEFORE updating the ticket
            $oldResolutionComment = $ticket->commentaire_resolution ?? '';
            
            if ($request->has('commentaire_resolution')) {
                $ticket->commentaire_resolution = $request->commentaire_resolution;
            }
            
            // Handle technician assignment
            if ($request->has('technicien_assigne') && $ticket->technicien_assigne != $request->technicien_assigne) {
                $oldTechnicianId = $ticket->technicien_assigne;
                $ticket->technicien_assigne = $request->technicien_assigne;
                $technicianChanged = true;
                
                if (is_null($ticket->date_assignation)) {
                    $ticket->date_assignation = now();
                }
            }

            // Synchronize equipment status based on ticket status
            if ($statusChanged) {
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
                } catch (\Exception $e) {
                    // Log error but don't fail the request
                    \Log::error('Error updating equipment status: ' . $e->getMessage());
                }
            }

            // Save the ticket
            $ticket->save();

            // Send notifications for changes
            if ($statusChanged) {
                \Log::info('=== STATUS CHANGED - SENDING NOTIFICATION ===');
                \Log::info('Status changed from ' . $oldStatus . ' to ' . $ticket->status);
                if ($updatedBy) {
                    \Log::info('Calling NotificationService::notifyTicketStatusChange');
                    \Log::info('Parameters: ticket_id=' . $ticket->id . ', user_id=' . $ticket->user_id . ', updatedBy=' . $updatedBy->id_user);
                    
                    // Force enable logging for this specific call
                    \Log::info('About to call NotificationService - enabling debug mode');
                    
                    
                    $result = NotificationService::notifyTicketStatusChange($ticket, $oldStatus, $ticket->status, $updatedBy);
                    \Log::info('Status change notification result: ' . ($result ? 'SUCCESS with ID: ' . $result->id : 'FAILED'));
                    
                    // Verify notification was created
                    $latestNotification = \App\Models\Notification::where('user_id', $ticket->user_id)->latest()->first();
                    if ($latestNotification) {
                        \Log::info('Latest notification for user ' . $ticket->user_id . ': ID=' . $latestNotification->id . ', Type=' . $latestNotification->type . ', Created=' . $latestNotification->date_creation);
                    } else {
                        \Log::error('NO NOTIFICATIONS FOUND for user ' . $ticket->user_id);
                    }
                    
                    // Count total notifications for this user
                    $totalNotifications = \App\Models\Notification::where('user_id', $ticket->user_id)->count();
                    \Log::info('Total notifications for user ' . $ticket->user_id . ': ' . $totalNotifications);
                } else {
                    \Log::error('Cannot send status change notification - no updatedBy user found');
                }
            } else {
                \Log::info('=== NO STATUS CHANGE DETECTED ===');
                \Log::info('Request status: ' . ($request->status ?? 'not provided'));
                \Log::info('Current ticket status: ' . $ticket->status);
                \Log::info('Status comparison result: ' . ($request->status !== $ticket->status ? 'DIFFERENT' : 'SAME'));
            }
            
            if ($technicianChanged) {
                if ($updatedBy) {
                    $newTechnician = User::find($ticket->technicien_assigne);
                    if ($newTechnician) {
                        $result = NotificationService::notifyTicketAssigned($ticket, $newTechnician, $updatedBy);
                        \Log::info('Technician assignment notification result: ' . ($result ? 'success' : 'failed'));
                    }
                } else {
                    \Log::warning('Cannot send technician assignment notification - no updatedBy user found');
                }
            }
            
            $commentContent = null;
            $isNewComment = false;
            
            // Check for actual new comment field
            if ($request->has('comment') && !empty($request->comment)) {
                $commentContent = $request->comment;
                $isNewComment = true;
                \Log::info('DETECTED NEW COMMENT FIELD - will create notification');
            }
            // Check if commentaire_resolution is being updated (only if it's different from current value)
            elseif ($request->has('commentaire_resolution') && !empty($request->commentaire_resolution)) {
                $newResolutionComment = $request->commentaire_resolution;
                
                \Log::info('Resolution comment comparison:', [
                    'old' => $oldResolutionComment,
                    'new' => $newResolutionComment,
                    'are_different' => $oldResolutionComment !== $newResolutionComment
                ]);
                
                // Only treat as new comment if the resolution comment actually changed
                if ($oldResolutionComment !== $newResolutionComment) {
                    $commentContent = $request->commentaire_resolution;
                    $isNewComment = true;
                    \Log::info('DETECTED NEW RESOLUTION COMMENT - will create notification');
                } else {
                    \Log::info('RESOLUTION COMMENT UNCHANGED - no notification needed');
                }
            }
            
            if ($commentContent && $isNewComment) {
                \Log::info('=== COMMENT NOTIFICATION DEBUG ===');
                \Log::info('Comment content detected: ' . $commentContent);
                \Log::info('Is new comment: ' . ($isNewComment ? 'YES' : 'NO'));
                \Log::info('Ticket user_id: ' . ($ticket->user_id ?? 'null'));
                \Log::info('Updated by user_id: ' . ($updatedBy->id_user ?? 'null'));
                \Log::info('Comment field used: ' . ($request->has('comment') ? 'comment' : 'commentaire_resolution'));
                if ($request->has('commentaire_resolution')) {
                    \Log::info('Old resolution comment: ' . ($ticket->commentaire_resolution ?? 'null'));
                    \Log::info('New resolution comment: ' . $request->commentaire_resolution);
                }
                
                if ($updatedBy) {
                    // Create a simple comment object for notification
                    $comment = (object) ['contenu' => $commentContent];
                    \Log::info('About to call NotificationService::notifyCommentAdded');
                    $result = NotificationService::notifyCommentAdded($ticket, $comment, $updatedBy);
                    \Log::info('Comment added notification result: ' . ($result ? 'SUCCESS with ID: ' . $result->id : 'FAILED'));
                    
                    if ($result) {
                        \Log::info('Comment notification created successfully with ID: ' . $result->id);
                        \Log::info('Notification details: user_id=' . $result->user_id . ', type=' . $result->type . ', title=' . $result->titre);
                    } else {
                        \Log::error('Failed to create comment notification - check NotificationService logic');
                        \Log::error('Possible reasons: user comparison failed, exception thrown, or database issue');
                    }
                } else {
                    \Log::warning('Cannot send comment notification - no updatedBy user found');
                }
            } else {
                \Log::info('=== NO COMMENT DETECTED ===');
                \Log::info('comment field: ' . ($request->comment ?? 'empty'));
                \Log::info('commentaire_resolution field: ' . ($request->commentaire_resolution ?? 'empty'));
            }

            return response()->json([
                'success' => true,
                'message' => 'Ticket mis à jour avec succès',
                'data' => $ticket->load(['user', 'technicien'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du ticket',
                'error' => $e->getMessage()
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
