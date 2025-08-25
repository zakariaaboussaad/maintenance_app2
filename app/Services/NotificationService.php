<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Models\Ticket;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Notify user when a technician takes their ticket
     */
    public static function notifyTicketTaken($ticket, $technician)
    {
        try {
            if (!$ticket->user_id || !$technician) {
                return false;
            }

            $titre = "Votre ticket a été pris en charge";
            $message = "Le technicien {$technician->nom} {$technician->prenom} a pris en charge votre ticket #{$ticket->id}: {$ticket->titre}";
            
            $data = [
                'ticket_id' => $ticket->id,
                'technician_id' => $technician->id_user,
                'technician_name' => $technician->nom . ' ' . $technician->prenom,
                'ticket_title' => $ticket->titre,
                'action' => 'ticket_taken'
            ];

            return Notification::createForUser(
                $ticket->user_id,
                Notification::TYPE_TICKET_ASSIGNED,
                $titre,
                $message,
                $data
            );
            
        } catch (\Exception $e) {
            Log::error('Error sending ticket taken notification: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Notify user when their ticket status changes
     */
    public static function notifyTicketStatusChange($ticket, $oldStatus, $newStatus, $updatedBy)
    {
        try {
            Log::info('=== NOTIFICATION SERVICE DEBUG ===');
            Log::info('Ticket user_id: ' . ($ticket->user_id ?? 'null'));
            Log::info('Updated by user_id: ' . ($updatedBy->id_user ?? 'null'));
            Log::info('Ticket ID: ' . ($ticket->id ?? 'null'));
            Log::info('Old status: ' . $oldStatus);
            Log::info('New status: ' . $newStatus);
            
            // Don't notify if no ticket user exists
            if (!$ticket->user_id) {
                Log::info('Skipping notification - no ticket user');
                return false;
            }
            
            // Don't notify if the ticket owner is the one making the change
            if ($ticket->user_id == $updatedBy->id_user) {
                Log::info('SKIPPING NOTIFICATION: Ticket owner is making the change');
                Log::info('ticket->user_id: ' . $ticket->user_id . ' == updatedBy->id_user: ' . $updatedBy->id_user);
                return false;
            }
            
            Log::info('NOTIFICATION SHOULD BE SENT: Different users detected');
            Log::info('ticket->user_id: ' . $ticket->user_id . ' != updatedBy->id_user: ' . $updatedBy->id_user);
            
            Log::info('Proceeding with notification - different users');
            Log::info('About to create notification for user_id: ' . $ticket->user_id);

            $statusLabels = [
                'ouvert' => 'Ouvert',
                'en_attente' => 'En attente',
                'en_cours' => 'En cours',
                'resolu' => 'Résolu',
                'ferme' => 'Fermé',
                'annule' => 'Annulé'
            ];

            $oldStatusLabel = $statusLabels[$oldStatus] ?? $oldStatus;
            $newStatusLabel = $statusLabels[$newStatus] ?? $newStatus;

            $titre = "Statut de votre ticket mis à jour";
            $message = "Le statut de votre ticket #{$ticket->id} \"{$ticket->titre}\" a été changé de \"{$oldStatusLabel}\" à \"{$newStatusLabel}\" par {$updatedBy->nom} {$updatedBy->prenom}.";
            
            $data = [
                'ticket_id' => $ticket->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'updated_by' => $updatedBy->id_user,
                'action' => 'status_change'
            ];

            // Choose notification type based on new status
            $notificationType = match($newStatus) {
                'resolu', 'ferme' => Notification::TYPE_TICKET_CLOSED,
                default => Notification::TYPE_TICKET_UPDATED
            };

            Log::info('Creating notification', [
                'user_id' => $ticket->user_id,
                'type' => $notificationType,
                'titre' => $titre
            ]);

            Log::info('Creating notification with parameters:', [
                'user_id' => $ticket->user_id,
                'type' => $notificationType,
                'titre' => $titre,
                'message' => substr($message, 0, 100) . '...'
            ]);

            $notification = Notification::createForUser(
                $ticket->user_id,
                $notificationType,
                $titre,
                $message,
                $data
            );
            
            Log::info('Notification created successfully', [
                'notification_id' => $notification->id ?? 'unknown',
                'user_id' => $notification->user_id ?? 'unknown',
                'type' => $notification->type ?? 'unknown'
            ]);
            
            return $notification;
            
        } catch (\Exception $e) {
            Log::error('Error sending ticket status change notification: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'ticket_id' => $ticket->id ?? 'unknown',
                'old_status' => $oldStatus,
                'new_status' => $newStatus
            ]);
            return false;
        }
    }

    /**
     * Notify user when a comment is added to their ticket
     */
    public static function notifyCommentAdded($ticket, $comment, $commentAuthor)
    {
        try {
            Log::info('=== COMMENT NOTIFICATION SERVICE DEBUG ===');
            Log::info('Ticket user_id: ' . ($ticket->user_id ?? 'null'));
            Log::info('Comment author user_id: ' . ($commentAuthor->id_user ?? 'null'));
            Log::info('Ticket ID: ' . ($ticket->id ?? 'null'));
            Log::info('Comment content: ' . ($comment->contenu ?? 'null'));
            
            // Don't notify if no ticket user exists
            if (!$ticket->user_id) {
                Log::info('SKIPPING: No ticket user_id');
                return false;
            }
            
            // Don't notify if the ticket owner is the one adding the comment
            if ($ticket->user_id == $commentAuthor->id_user) {
                Log::info('SKIPPING COMMENT NOTIFICATION: Comment author is ticket owner');
                Log::info('ticket->user_id: ' . $ticket->user_id . ' == commentAuthor->id_user: ' . $commentAuthor->id_user);
                return false;
            }

            Log::info('PROCEEDING: Different users - notification should be sent');

            $titre = "Nouveau commentaire sur votre ticket";
            $message = "{$commentAuthor->nom} {$commentAuthor->prenom} a ajouté un commentaire sur votre ticket #{$ticket->id}: {$ticket->titre}";
            
            $data = [
                'ticket_id' => $ticket->id,
                'comment_author_id' => $commentAuthor->id_user,
                'comment_author_name' => $commentAuthor->nom . ' ' . $commentAuthor->prenom,
                'ticket_title' => $ticket->titre,
                'comment_preview' => substr($comment->contenu ?? '', 0, 100),
                'action' => 'comment_added'
            ];

            $notification = Notification::createForUser(
                $ticket->user_id,
                Notification::TYPE_COMMENT_ADDED,
                $titre,
                $message,
                $data
            );
            
            Log::info('Comment notification creation result: ' . ($notification ? 'SUCCESS' : 'FAILED'));
            if ($notification) {
                Log::info('Created notification ID: ' . $notification->id . ' for user: ' . $notification->user_id);
            }
            
            return $notification;
            
        } catch (\Exception $e) {
            Log::error('Error sending comment added notification: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return false;
        }
    }

    /**
     * Notify technician when admin assigns a ticket to them
     */
    public static function notifyTicketAssigned($ticket, $technician, $assignedBy)
    {
        try {
            if (!$technician || !$assignedBy) {
                return false;
            }

            $titre = "Nouveau ticket assigné";
            $message = "{$assignedBy->nom} {$assignedBy->prenom} vous a assigné le ticket #{$ticket->id}: {$ticket->titre}";
            
            $data = [
                'ticket_id' => $ticket->id,
                'ticket_title' => $ticket->titre,
                'assigned_by_id' => $assignedBy->id_user,
                'assigned_by_name' => $assignedBy->nom . ' ' . $assignedBy->prenom,
                'priority' => $ticket->priorite ?? 'normale',
                'user_name' => $ticket->user ? $ticket->user->nom . ' ' . $ticket->user->prenom : '',
                'action' => 'ticket_assigned'
            ];

            return Notification::createForUser(
                $technician->id_user,
                Notification::TYPE_TICKET_ASSIGNED,
                $titre,
                $message,
                $data
            );
            
        } catch (\Exception $e) {
            Log::error('Error sending ticket assigned notification: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Notify user when a new ticket is created (for admins/supervisors)
     */
    public static function notifyNewTicketCreated($ticket)
    {
        try {
            // Get all admins and supervisors (assuming role_id 1 = admin, 2 = supervisor)
            $admins = User::whereIn('role_id', [1, 2])->get();

            if ($admins->isEmpty()) {
                return false;
            }

            $titre = "Nouveau ticket créé";
            $userName = $ticket->user ? $ticket->user->nom . ' ' . $ticket->user->prenom : 'Utilisateur inconnu';
            $message = "Un nouveau ticket #{$ticket->id}: {$ticket->titre} a été créé par {$userName}";
            
            $data = [
                'ticket_id' => $ticket->id,
                'ticket_title' => $ticket->titre,
                'user_id' => $ticket->user_id,
                'user_name' => $userName,
                'priority' => $ticket->priorite ?? 'normale',
                'category' => $ticket->categorie ?? '',
                'action' => 'ticket_created'
            ];

            $adminIds = $admins->pluck('id_user')->toArray();
            
            Notification::createForUsers(
                $adminIds,
                Notification::TYPE_TICKET_NEW,
                $titre,
                $message,
                $data
            );

            return count($adminIds);
            
        } catch (\Exception $e) {
            Log::error('Error sending new ticket notification: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send test notification to admin users
     */
    public static function sendTestNotification($sender)
    {
        try {
            // Get all admin users (role_id = 1)
            $admins = User::where('role_id', 1)->get();

            if ($admins->isEmpty()) {
                return 0;
            }

            $titre = "Notification de test";
            $message = "Ceci est une notification de test envoyée par {$sender->nom} {$sender->prenom} pour vérifier le système de notifications.";
            
            $data = [
                'sender_id' => $sender->id_user,
                'sender_name' => $sender->nom . ' ' . $sender->prenom,
                'test_time' => now()->format('Y-m-d H:i:s'),
                'action' => 'test_notification'
            ];

            $adminIds = $admins->pluck('id_user')->toArray();
            
            Notification::createForUsers(
                $adminIds,
                Notification::TYPE_SYSTEM,
                $titre,
                $message,
                $data
            );

            return count($adminIds);
            
        } catch (\Exception $e) {
            Log::error('Error sending test notification: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get notification statistics for a user
     */
    public static function getNotificationStats($userId)
    {
        try {
            return [
                'total' => Notification::forUser($userId)->count(),
                'unread' => Notification::forUser($userId)->unread()->count(),
                'recent' => Notification::forUser($userId)->recent()->count(),
                'by_type' => Notification::forUser($userId)
                    ->selectRaw('type, COUNT(*) as count')
                    ->groupBy('type')
                    ->pluck('count', 'type')
                    ->toArray()
            ];
        } catch (\Exception $e) {
            Log::error('Error getting notification stats: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Notify admins when a user requests password change
     */
    public static function notifyPasswordChangeRequest($passwordRequest, $user)
    {
        try {
            // Get all admin users (role_id = 1)
            $admins = User::where('role_id', 1)->get();

            if ($admins->isEmpty()) {
                return false;
            }

            $titre = "Demande de changement de mot de passe";
            $message = "{$user->nom} {$user->prenom} demande un changement de mot de passe.";
            
            $data = [
                'password_request_id' => $passwordRequest->id,
                'user_id' => $user->id_user,
                'user_name' => $user->nom . ' ' . $user->prenom,
                'user_email' => $user->email,
                'reason' => $passwordRequest->reason,
                'requested_at' => $passwordRequest->requested_at->format('Y-m-d H:i:s'),
                'action' => 'password_change_request'
            ];

            $adminIds = $admins->pluck('id_user')->toArray();
            
            Notification::createForUsers(
                $adminIds,
                'password_request',
                $titre,
                $message,
                $data
            );

            return count($adminIds);
            
        } catch (\Exception $e) {
            Log::error('Error sending password change request notification: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Notify user when password is changed by admin
     */
    public static function notifyPasswordChanged($passwordRequest, $admin)
    {
        try {
            $user = $passwordRequest->user;
            
            $titre = "Votre mot de passe a été mis à jour";
            $message = "Votre demande de changement de mot de passe a été approuvée par {$admin->nom} {$admin->prenom}.";
            
            $data = [
                'password_request_id' => $passwordRequest->id,
                'new_password' => $passwordRequest->new_password,
                'admin_name' => $admin->nom . ' ' . $admin->prenom,
                'approved_at' => $passwordRequest->approved_at->format('Y-m-d H:i:s'),
                'action' => 'password_changed',
                'one_time_view' => true
            ];

            return Notification::createForUser(
                $user->id_user,
                'password_changed',
                $titre,
                $message,
                $data
            );
            
        } catch (\Exception $e) {
            Log::error('Error sending password changed notification: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Notify user when password request is rejected
     */
    public static function notifyPasswordRequestRejected($passwordRequest, $admin)
    {
        try {
            $user = $passwordRequest->user;
            
            $titre = "Demande de changement de mot de passe rejetée";
            $message = "Votre demande de changement de mot de passe a été rejetée par {$admin->nom} {$admin->prenom}.";
            
            $data = [
                'password_request_id' => $passwordRequest->id,
                'rejection_reason' => $passwordRequest->rejection_reason,
                'admin_name' => $admin->nom . ' ' . $admin->prenom,
                'rejected_at' => $passwordRequest->rejected_at->format('Y-m-d H:i:s'),
                'action' => 'password_request_rejected'
            ];

            return Notification::createForUser(
                $user->id_user,
                'password_rejected',
                $titre,
                $message,
                $data
            );
            
        } catch (\Exception $e) {
            Log::error('Error sending password request rejected notification: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Clean old notifications (older than 30 days and read)
     */
    public static function cleanOldNotifications()
    {
        try {
            $deleted = Notification::where('lu', true)
                ->where('date_creation', '<', now()->subDays(30))
                ->delete();
            
            Log::info("Cleaned {$deleted} old notifications");
            return $deleted;
            
        } catch (\Exception $e) {
            Log::error('Error cleaning old notifications: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Mark notifications as read when user views related content
     */
    public static function markRelatedNotificationsAsRead($userId, $ticketId)
    {
        try {
            Notification::forUser($userId)
                ->unread()
                ->where('data->ticket_id', $ticketId)
                ->update(['lu' => true]);
                
            return true;
        } catch (\Exception $e) {
            Log::error('Error marking related notifications as read: ' . $e->getMessage());
            return false;
        }
    }
}