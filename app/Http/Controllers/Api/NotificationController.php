<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Afficher tous les notificiation
     */
    public function index()
    {
        try {
            $notifications = Notification::with('user')->get();

            return response()->json([
                'success' => true,
                'data' => $notifications,
                'count' => $notifications->count()
            ]);
        } catch (\Exception $n) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des notifications',
                'error' => $n->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher une notification spécifique
     */
    public function show($id)
    {
        try {
            $notification = Notification::with(['user', 'tickets', 'pannes', 'equipement'])
                                  ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $notification
            ]);
        } catch (\Exception $n) {
            return response()->json([
                'success' => false,
                'message' => 'notification non trouvé',
                'error' => $n->getMessage()
            ], 404);
        }
    }

}
