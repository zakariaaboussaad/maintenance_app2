<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    /**
     * Get all notifications
     */
    public function index(Request $request)
    {
        try {
            // Add detailed logging for debugging
            Log::info('=== NOTIFICATION INDEX REQUEST ===');
            Log::info('Request headers: ', $request->headers->all());
            Log::info('Auth user: ', [
                'user' => Auth::user() ? Auth::user()->toArray() : null,
                'guard' => Auth::getDefaultDriver(),
                'token_present' => $request->bearerToken() ? 'Yes' : 'No'
            ]);

            // Check if user is authenticated
            $user = Auth::user();
            if (!$user) {
                Log::warning('User not authenticated in notifications index');
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            $query = Notification::with('user');

            // Filter by user if specified, otherwise show all (for admins)
            if ($request->has('user_id')) {
                $query->forUser($request->user_id);
            } elseif ($user->role_id !== 1) {
                // Non-admin users can only see their own notifications
                $query->forUser($user->id_user);
            }

            // Filter by type if specified
            if ($request->has('type')) {
                $query->byType($request->type);
            }

            // Filter by read status if specified
            if ($request->has('lu')) {
                if ($request->lu === 'true' || $request->lu === '1') {
                    $query->read();
                } else {
                    $query->unread();
                }
            }

            // Order by most recent first
            $notifications = $query->orderBy('date_creation', 'desc')
                                  ->paginate($request->get('per_page', 50));

            Log::info('Notifications retrieved successfully', [
                'count' => $notifications->count(),
                'total' => $notifications->total()
            ]);

            return response()->json([
                'success' => true,
                'data' => $notifications->items(),
                'unread_count' => Notification::forUser($user->id_user)->unread()->count(),
                'pagination' => [
                    'current_page' => $notifications->currentPage(),
                    'per_page' => $notifications->perPage(),
                    'total' => $notifications->total(),
                    'last_page' => $notifications->lastPage()
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Notification index error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'user' => Auth::user() ? Auth::user()->id_user : 'not authenticated'
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des notifications',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get notifications for current authenticated user
     */
    public function getUserNotifications(Request $request)
    {
        try {
            Log::info('=== GET USER NOTIFICATIONS REQUEST ===');

            $user = Auth::user();
            if (!$user) {
                Log::warning('User not authenticated in getUserNotifications');
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            Log::info('User authenticated', ['user_id' => $user->id_user]);

            $userId = $user->id_user;

            $query = Notification::forUser($userId);

            // Filter by read status if specified
            if ($request->has('unread_only') && $request->unread_only) {
                $query->unread();
            }

            $notifications = $query->orderBy('date_creation', 'desc')
                                  ->paginate($request->get('per_page', 20));

            $unreadCount = Notification::forUser($userId)->unread()->count();

            Log::info('User notifications retrieved', [
                'user_id' => $userId,
                'count' => $notifications->count(),
                'unread_count' => $unreadCount
            ]);

            return response()->json([
                'success' => true,
                'data' => $notifications->items(),
                'unread_count' => $unreadCount,
                'pagination' => [
                    'current_page' => $notifications->currentPage(),
                    'per_page' => $notifications->perPage(),
                    'total' => $notifications->total(),
                    'last_page' => $notifications->lastPage()
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Get user notifications error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'user' => Auth::user() ? Auth::user()->id_user : 'not authenticated'
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des notifications',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Show specific notification
     */
    public function show($id)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            $notification = Notification::with('user')->findOrFail($id);

            // Check if user has permission to view this notification
            if ($user->role_id !== 1 && $notification->user_id !== $user->id_user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            // Automatically mark as read when viewed
            if (!$notification->lu) {
                $notification->markAsRead();
            }

            return response()->json([
                'success' => true,
                'data' => $notification
            ]);
        } catch (\Exception $e) {
            Log::error('Show notification error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Notification non trouvée',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 404);
        }
    }

    /**
     * Mark notification as read
     */
    public function markAsRead($id)
    {
        try {
            \Log::info('=== MARK AS READ REQUEST ===', ['notification_id' => $id]);
            
            $user = Auth::user();
            if (!$user) {
                \Log::warning('User not authenticated in markAsRead');
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            \Log::info('User authenticated', ['user_id' => $user->id_user]);

            $notification = Notification::find($id);
            if (!$notification) {
                \Log::warning('Notification not found', ['notification_id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Notification non trouvée'
                ], 404);
            }

            \Log::info('Notification found', [
                'notification_id' => $notification->id,
                'user_id' => $notification->user_id,
                'current_user' => $user->id_user
            ]);

            // Check if user has permission to modify this notification
            if ($user->role_id !== 1 && $notification->user_id !== $user->id_user) {
                \Log::warning('Access denied', [
                    'user_role' => $user->role_id,
                    'notification_user' => $notification->user_id,
                    'current_user' => $user->id_user
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $notification->markAsRead();

            \Log::info('Notification marked as read successfully', [
                'notification_id' => $id,
                'user_id' => $user->id_user
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Notification marquée comme lue'
            ]);
        } catch (\Exception $e) {
            \Log::error('Mark as read error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'notification_id' => $id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de la notification',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Mark all notifications as read for current user
     */
    public function markAllAsRead()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            $userId = $user->id_user;

            $updatedCount = Notification::forUser($userId)->unread()->update(['lu' => true]);

            Log::info('All notifications marked as read', [
                'user_id' => $userId,
                'updated_count' => $updatedCount
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Toutes les notifications ont été marquées comme lues',
                'updated_count' => $updatedCount
            ]);
        } catch (\Exception $e) {
            Log::error('Mark all as read error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour des notifications',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Delete notification
     */
    public function destroy($id)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            $notification = Notification::findOrFail($id);

            // Check if user has permission to delete this notification
            if ($user->role_id !== 1 && $notification->user_id !== $user->id_user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $notification->delete();

            Log::info('Notification deleted', [
                'notification_id' => $id,
                'user_id' => $user->id_user
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Notification supprimée avec succès'
            ]);
        } catch (\Exception $e) {
            Log::error('Delete notification error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de la notification',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Clear all notifications for current user
     */
    public function clearAll()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            $userId = $user->id_user;
            $deletedCount = Notification::forUser($userId)->delete();

            Log::info('All notifications cleared', [
                'user_id' => $userId,
                'deleted_count' => $deletedCount
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Toutes les notifications ont été supprimées',
                'deleted_count' => $deletedCount
            ]);
        } catch (\Exception $e) {
            Log::error('Clear all notifications error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression des notifications',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get notification count for current user
     */
    public function getUnreadCount()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            $userId = $user->id_user;
            $count = Notification::forUser($userId)->unread()->count();

            Log::info('Unread count retrieved', [
                'user_id' => $userId,
                'count' => $count
            ]);

            return response()->json([
                'success' => true,
                'unread_count' => $count
            ]);
        } catch (\Exception $e) {
            Log::error('Get unread count error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du comptage des notifications',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Send a test notification to admin users
     */
    public function sendTestNotification()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            // Only allow admins to send test notifications
            if ($user->role_id !== 1) { // Assuming role_id 1 is admin
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé. Seuls les administrateurs peuvent envoyer des notifications de test.'
                ], 403);
            }

            // Create a test notification for the current user
            $notification = Notification::createForUser(
                $user->id_user,
                'system',
                'Notification de test',
                'Ceci est une notification de test envoyée le ' . now()->format('d/m/Y à H:i:s'),
                ['test' => true, 'sent_by' => $user->id_user]
            );

            Log::info('Test notification sent', [
                'sent_by' => $user->id_user,
                'notification_id' => $notification->id_notification
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Notification de test envoyée avec succès',
                'data' => $notification
            ]);

        } catch (\Exception $e) {
            Log::error('Send test notification error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'envoi de la notification de test',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Create sample notifications for testing (development only)
     */
    public function createSampleNotifications()
    {
        try {
            if (!config('app.debug')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cette fonctionnalité n\'est disponible qu\'en mode développement'
                ], 403);
            }

            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            $sampleNotifications = [
                [
                    'type' => 'ticket_nouveau',
                    'titre' => 'Nouveau ticket créé',
                    'message' => 'Un nouveau ticket a été créé par John Doe pour l\'équipement PC-001'
                ],
                [
                    'type' => 'ticket_assigne',
                    'titre' => 'Ticket assigné',
                    'message' => 'Le ticket #TK-001 vous a été assigné'
                ],
                [
                    'type' => 'panne_signale',
                    'titre' => 'Panne signalée',
                    'message' => 'Une panne a été signalée sur l\'équipement SERV-001'
                ],
                [
                    'type' => 'maintenance_due',
                    'titre' => 'Maintenance planifiée',
                    'message' => 'Une maintenance est prévue demain pour 3 équipements'
                ],
                [
                    'type' => 'system',
                    'titre' => 'Mise à jour système',
                    'message' => 'Le système sera mis à jour ce soir entre 20h et 22h'
                ]
            ];

            $created = [];
            foreach ($sampleNotifications as $notifData) {
                $notification = Notification::createForUser(
                    $user->id_user,
                    $notifData['type'],
                    $notifData['titre'],
                    $notifData['message'],
                    ['sample' => true]
                );
                $created[] = $notification;
            }

            return response()->json([
                'success' => true,
                'message' => count($created) . ' notifications d\'exemple créées',
                'data' => $created
            ]);

        } catch (\Exception $e) {
            Log::error('Create sample notifications error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création des notifications d\'exemple',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}
