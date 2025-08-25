<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Equipement;
use App\Models\User;
use App\Models\Ticket;

class SimpleExportController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function exportEquipmentCsv(Request $request)
    {
        try {
            $user = auth('sanctum')->user();
            
            if (!$user || $user->role_id !== 1) {
                return response()->json(['error' => 'Unauthorized', 'user_role_id' => $user ? $user->role_id : null], 403);
            }

            $equipments = Equipement::all();
            
            $csvData = "Nom,Type,Numero de Serie,Statut\n";
            
            foreach ($equipments as $equipment) {
                $csvData .= sprintf(
                    "%s,%s,%s,%s\n",
                    $equipment->modele ?? '',
                    $equipment->marque ?? '',
                    $equipment->numero_serie ?? '',
                    $equipment->status ?? ''
                );
            }

            $headers = [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => 'attachment; filename="equipements_' . date('Y-m-d') . '.csv"',
                'Cache-Control' => 'max-age=0',
            ];

            // Add BOM for proper UTF-8 encoding in Excel
            $csvData = "\xEF\xBB\xBF" . $csvData;

            return response($csvData, 200, $headers);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Export failed',
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ], 500);
        }
    }

    public function exportUsersCsv(Request $request)
    {
        try {
            $user = auth('sanctum')->user();
            
            if (!$user || $user->role_id !== 1) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $users = User::all();
            
            $csvData = "Nom,Prenom,Email,Telephone,Role\n";
            
            foreach ($users as $user) {
                $roleName = match($user->role_id) {
                    1 => 'Administrateur',
                    2 => 'Technicien', 
                    3 => 'Utilisateur',
                    default => 'Non défini'
                };
                
                $csvData .= sprintf(
                    "%s,%s,%s,%s,%s\n",
                    $user->nom ?? '',
                    $user->prenom ?? '',
                    $user->email ?? '',
                    $user->numero_telephone ?? '',
                    $roleName
                );
            }

            $headers = [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => 'attachment; filename="utilisateurs_' . date('Y-m-d') . '.csv"',
                'Cache-Control' => 'max-age=0',
            ];

            $csvData = "\xEF\xBB\xBF" . $csvData;

            return response($csvData, 200, $headers);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Export failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
