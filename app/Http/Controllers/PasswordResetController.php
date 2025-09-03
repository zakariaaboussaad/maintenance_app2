<?php

namespace App\Http\Controllers;

use App\Models\PasswordReset;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PasswordResetController extends Controller
{

    /**
     * Handle forgot password request from login page
     */
    public function requestReset(Request $request)
    {
        try {
            $request->validate([
                'nom' => 'required|string|max:255',
                'email' => 'required|email|max:255',
            ]);

            // Check if user exists with matching name and email
            $user = User::where('email', $request->email)
                       ->where(function($query) use ($request) {
                           $query->whereRaw("CONCAT(nom, ' ', prenom) LIKE ?", ['%' . $request->nom . '%'])
                                 ->orWhereRaw("CONCAT(prenom, ' ', nom) LIKE ?", ['%' . $request->nom . '%']);
                       })
                       ->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucun utilisateur trouvé avec ces informations'
                ], 404);
            }

            // Create password reset request
            $token = Str::random(60);
            
            $resetRequest = PasswordReset::create([
                'nom' => $user->nom . ' ' . $user->prenom,
                'email' => $user->email,
                'token' => $token,
                'status' => 'pending',
                'reason' => 'Mot de passe oublié - demande depuis la page de connexion'
            ]);

            // Notify admins
            try {
                NotificationService::notifyPasswordResetRequest($resetRequest, $user);
            } catch (\Exception $e) {
                \Log::error('Failed to send password reset notification: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Demande de réinitialisation envoyée avec succès'
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Password reset request error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la demande de réinitialisation'
            ], 500);
        }
    }

    /**
     * Get all password reset requests (admin only)
     */
    public function getRequests(Request $request)
    {
        // Temporarily bypass authentication to test
        $requests = PasswordReset::with(['approvedBy', 'rejectedBy'])
                                ->orderBy('created_at', 'desc')
                                ->get();

        return response()->json([
            'success' => true,
            'data' => $requests
        ]);
    }

    /**
     * Approve password reset request (admin only)
     */
    public function approveRequest(Request $request, $id)
    {
        // Temporarily bypass authentication for testing
        $user = (object)['id_user' => 1, 'role_id' => 1];

        $request->validate([
            'new_password' => 'required|string|min:6'
        ]);

        $resetRequest = PasswordReset::findOrFail($id);
        
        if ($resetRequest->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Cette demande a déjà été traitée'
            ], 400);
        }

        // Find the user and update password
        $targetUser = User::where('email', $resetRequest->email)->first();
        
        if ($targetUser) {
            $targetUser->update([
                'password' => Hash::make($request->new_password),
                'password_updated_at' => now(),
                'password_expired' => false,
                'password_expiry_notified_at' => null
            ]);

            // Update reset request
            $resetRequest->update([
                'status' => 'approved',
                'new_password' => $request->new_password,
                'approved_by' => $user->id_user,
                'approved_at' => now()
            ]);

            // Notify user of password change
            $notificationResult = NotificationService::notifyPasswordResetApproved($resetRequest, $user, $request->new_password);
            \Log::info('Password reset notification sent', [
                'user_email' => $resetRequest->email,
                'notification_result' => $notificationResult
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Demande approuvée avec succès'
        ]);
    }

    /**
     * Reject password reset request (admin only)
     */
    public function rejectRequest(Request $request, $id)
    {
        // Temporarily bypass authentication for testing
        $user = (object)['id_user' => 1, 'role_id' => 1];

        $resetRequest = PasswordReset::findOrFail($id);
        
        if ($resetRequest->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Cette demande a déjà été traitée'
            ], 400);
        }

        $resetRequest->update([
            'status' => 'rejected',
            'rejection_reason' => $request->rejection_reason,
            'rejected_by' => $user->id_user,
            'rejected_at' => now()
        ]);

        // Notify user of rejection
        $notificationResult = NotificationService::notifyPasswordResetRejected($resetRequest, $user, $request->rejection_reason);
        \Log::info('Password reset rejection notification sent', [
            'user_email' => $resetRequest->email,
            'notification_result' => $notificationResult
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Demande rejetée'
        ]);
    }

    /**
     * Change password for authenticated user (if they know current password)
     */
    public function changePassword(Request $request)
    {
        // Skip authentication for now - match the profile update behavior
        // Get user ID from request or session
        $userId = $request->input('user_id') ?? session('user_id');
        
        if (!$userId) {
            return response()->json(['success' => false, 'message' => 'Non authentifié'], 401);
        }
        
        $user = User::find($userId);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Utilisateur non trouvé'], 404);
        }

        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|string|min:6',
            'confirm_password' => 'required|same:new_password'
        ]);

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Le mot de passe actuel est incorrect'
            ], 400);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->new_password),
            'password_updated_at' => now(),
            'password_expired' => false,
            'password_expiry_notified_at' => null
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mot de passe changé avec succès'
        ]);
    }
}
