<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PasswordRequest;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PasswordRequestController extends Controller
{
    /**
     * Create a new password change request
     */
    public function createRequest(Request $request)
    {
        try {
            $request->validate([
                'current_password' => 'required|string',
                'reason' => 'nullable|string|max:500'
            ]);

            $user = auth('sanctum')->user();
            if (!$user) {
                return response()->json(['error' => 'Utilisateur non authentifié'], 401);
            }

            // Verify current password
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json(['error' => 'Mot de passe actuel incorrect'], 400);
            }

            // Check if user already has a pending request
            $existingRequest = PasswordRequest::where('user_id', $user->id_user)
                ->where('status', 'pending')
                ->first();

            if ($existingRequest) {
                return response()->json(['error' => 'Vous avez déjà une demande en cours'], 400);
            }

            // Create password request
            $passwordRequest = PasswordRequest::create([
                'user_id' => $user->id_user,
                'reason' => $request->reason,
                'status' => 'pending',
                'requested_at' => now()
            ]);

            // Notify all admins
            NotificationService::notifyPasswordChangeRequest($passwordRequest, $user);

            return response()->json([
                'success' => true,
                'message' => 'Demande de changement de mot de passe envoyée'
            ]);

        } catch (\Exception $e) {
            Log::error('Error creating password request: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de la création de la demande'], 500);
        }
    }

    /**
     * Get password requests for admin
     */
    public function getRequests()
    {
        try {
            $user = auth('sanctum')->user();
            if (!$user || $user->role_id !== 1) {
                return response()->json(['error' => 'Accès non autorisé'], 403);
            }

            $requests = PasswordRequest::with('user')
                ->orderBy('requested_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $requests
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching password requests: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de la récupération des demandes'], 500);
        }
    }

    /**
     * Approve password request and set new password
     */
    public function approveRequest(Request $request, $requestId)
    {
        try {
            $request->validate([
                'new_password' => 'required|string|min:6'
            ]);

            $admin = auth('sanctum')->user();
            if (!$admin || $admin->role_id !== 1) {
                return response()->json(['error' => 'Accès non autorisé'], 403);
            }

            $passwordRequest = PasswordRequest::with('user')->find($requestId);
            if (!$passwordRequest) {
                return response()->json(['error' => 'Demande non trouvée'], 404);
            }

            if ($passwordRequest->status !== 'pending') {
                return response()->json(['error' => 'Cette demande a déjà été traitée'], 400);
            }

            // Update user password
            $user = $passwordRequest->user;
            $user->password = Hash::make($request->new_password);
            $user->save();

            // Update request status
            $passwordRequest->update([
                'status' => 'approved',
                'new_password' => $request->new_password, // Store temporarily for notification
                'approved_by' => $admin->id_user,
                'approved_at' => now()
            ]);

            // Notify user with new password
            NotificationService::notifyPasswordChanged($passwordRequest, $admin);

            return response()->json([
                'success' => true,
                'message' => 'Demande approuvée et nouveau mot de passe envoyé'
            ]);

        } catch (\Exception $e) {
            Log::error('Error approving password request: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de l\'approbation'], 500);
        }
    }

    /**
     * Reject password request
     */
    public function rejectRequest(Request $request, $requestId)
    {
        try {
            $request->validate([
                'rejection_reason' => 'nullable|string|max:500'
            ]);

            $admin = auth('sanctum')->user();
            if (!$admin || $admin->role_id !== 1) {
                return response()->json(['error' => 'Accès non autorisé'], 403);
            }

            $passwordRequest = PasswordRequest::with('user')->find($requestId);
            if (!$passwordRequest) {
                return response()->json(['error' => 'Demande non trouvée'], 404);
            }

            if ($passwordRequest->status !== 'pending') {
                return response()->json(['error' => 'Cette demande a déjà été traitée'], 400);
            }

            // Update request status
            $passwordRequest->update([
                'status' => 'rejected',
                'rejection_reason' => $request->rejection_reason,
                'rejected_by' => $admin->id_user,
                'rejected_at' => now()
            ]);

            // Notify user of rejection
            NotificationService::notifyPasswordRequestRejected($passwordRequest, $admin);

            return response()->json([
                'success' => true,
                'message' => 'Demande rejetée'
            ]);

        } catch (\Exception $e) {
            Log::error('Error rejecting password request: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors du rejet'], 500);
        }
    }
}
