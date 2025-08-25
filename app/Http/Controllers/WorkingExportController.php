<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WorkingExportController extends Controller
{
    public function exportEquipment(Request $request)
    {
        try {
            // Get equipment data directly from database
            $equipments = DB::table('equipements')->get();
            
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
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function exportUsers(Request $request)
    {
        try {
            // Get users data directly from database
            $users = DB::table('users')->get();
            
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

    public function exportTickets(Request $request)
    {
        try {
            // Get tickets with related data using joins
            $tickets = DB::table('tickets')
                ->leftJoin('users as creator', 'tickets.user_id', '=', 'creator.id_user')
                ->leftJoin('users as tech', 'tickets.technicien_assigne', '=', 'tech.id_user')
                ->leftJoin('equipements', 'tickets.equipement_id', '=', 'equipements.numero_serie')
                ->select(
                    'tickets.id',
                    'tickets.titre',
                    'tickets.description',
                    'tickets.status',
                    'tickets.priorite',
                    'tickets.created_at',
                    'tickets.updated_at',
                    DB::raw('CONCAT(creator.prenom, " ", creator.nom) as creator_name'),
                    DB::raw('CONCAT(tech.prenom, " ", tech.nom) as tech_name'),
                    'equipements.modele as equipment_name'
                )
                ->get();
            
            $csvData = "ID,Titre,Description,Statut,Priorite,Createur,Technicien,Equipement,Date Creation,Date Mise a Jour\n";
            
            foreach ($tickets as $ticket) {
                $csvData .= sprintf(
                    "%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                    $ticket->id ?? '',
                    str_replace(['"', ','], ['""', ';'], $ticket->titre ?? ''),
                    str_replace(['"', ','], ['""', ';'], $ticket->description ?? ''),
                    $ticket->status ?? '',
                    $ticket->priorite ?? '',
                    $ticket->creator_name ?? '',
                    $ticket->tech_name ?? 'Non assigné',
                    $ticket->equipment_name ?? '',
                    $ticket->created_at ?? '',
                    $ticket->updated_at ?? ''
                );
            }

            $headers = [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => 'attachment; filename="tickets_' . date('Y-m-d') . '.csv"',
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
