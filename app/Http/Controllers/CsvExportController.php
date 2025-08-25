<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\Equipement;
use App\Models\User;
use App\Models\Ticket;
use Carbon\Carbon;

class CsvExportController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware(function ($request, $next) {
            $user = auth('sanctum')->user();
            if (!$user || $user->role_id !== 1) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
            return $next($request);
        });
    }

    public function exportEquipmentFull(Request $request)
    {
        $equipments = Equipement::with('utilisateurAssigne')->get();
        
        $headers = [
            'Nom',
            'Type',
            'Numéro de Série',
            'Statut',
            'Utilisateur Assigné',
            'Email Utilisateur',
            'Date d\'Installation',
            'Date de Création',
            'Dernière Mise à Jour'
        ];

        $data = [];
        $data[] = $headers;

        foreach ($equipments as $equipment) {
            $data[] = [
                $equipment->modele,
                $equipment->marque,
                $equipment->numero_serie,
                $equipment->status,
                $equipment->utilisateurAssigne ? ($equipment->utilisateurAssigne->prenom . ' ' . $equipment->utilisateurAssigne->nom) : 'Non assigné',
                $equipment->utilisateurAssigne ? $equipment->utilisateurAssigne->email : '',
                $equipment->date_installation ? $equipment->date_installation->format('d/m/Y') : '',
                $equipment->created_at->format('d/m/Y H:i'),
                $equipment->updated_at->format('d/m/Y H:i')
            ];
        }

        return $this->downloadCsv($data, 'equipements_complets');
    }

    public function exportEquipmentOnly(Request $request)
    {
        $equipments = Equipement::all();
        
        $headers = ['Nom', 'Type', 'Numéro de Série', 'Statut'];
        $data = [];
        $data[] = $headers;

        foreach ($equipments as $equipment) {
            $data[] = [
                $equipment->modele,
                $equipment->marque,
                $equipment->numero_serie,
                $equipment->status
            ];
        }

        return $this->downloadCsv($data, 'equipements');
    }

    public function exportUsers(Request $request)
    {
        $users = User::all();
        
        $headers = [
            'Nom',
            'Prénom',
            'Email',
            'Téléphone',
            'Rôle',
            'Date de Création',
            'Dernière Connexion'
        ];

        $data = [];
        $data[] = $headers;

        foreach ($users as $user) {
            $data[] = [
                $user->nom,
                $user->prenom,
                $user->email,
                $user->numero_telephone,
                $user->getRoleNameAttribute(),
                $user->created_at->format('d/m/Y H:i'),
                $user->last_login_at ? $user->last_login_at->format('d/m/Y H:i') : 'Jamais'
            ];
        }

        return $this->downloadCsv($data, 'utilisateurs');
    }

    public function exportTickets(Request $request)
    {
        $tickets = Ticket::with(['user', 'technicien', 'equipement'])->get();
        
        $headers = [
            'ID',
            'Titre',
            'Description',
            'Statut',
            'Priorité',
            'Créateur',
            'Technicien Assigné',
            'Équipement',
            'Date de Création',
            'Date de Mise à Jour',
            'Date de Fermeture'
        ];

        $data = [];
        $data[] = $headers;

        foreach ($tickets as $ticket) {
            $data[] = [
                $ticket->id,
                $ticket->titre,
                $ticket->description,
                $ticket->status,
                $ticket->priorite,
                $ticket->user ? ($ticket->user->prenom . ' ' . $ticket->user->nom) : '',
                $ticket->technicien ? ($ticket->technicien->prenom . ' ' . $ticket->technicien->nom) : 'Non assigné',
                $ticket->equipement ? $ticket->equipement->modele : '',
                $ticket->created_at->format('d/m/Y H:i'),
                $ticket->updated_at->format('d/m/Y H:i'),
                $ticket->status === 'ferme' ? $ticket->updated_at->format('d/m/Y H:i') : ''
            ];
        }

        return $this->downloadCsv($data, 'tickets');
    }

    public function exportMonthlyReport(Request $request)
    {
        $currentMonth = Carbon::now();
        $startOfMonth = $currentMonth->copy()->startOfMonth();
        $endOfMonth = $currentMonth->copy()->endOfMonth();

        // Summary statistics
        $totalTickets = Ticket::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();
        $resolvedTickets = Ticket::whereBetween('updated_at', [$startOfMonth, $endOfMonth])
                                ->where('status', 'resolu')->count();
        $closedTickets = Ticket::whereBetween('updated_at', [$startOfMonth, $endOfMonth])
                               ->where('status', 'ferme')->count();
        $newEquipment = Equipement::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();

        $data = [];
        $data[] = ['RAPPORT MENSUEL - ' . $startOfMonth->format('F Y')];
        $data[] = [''];
        $data[] = ['STATISTIQUES TICKETS'];
        $data[] = ['Nouveaux tickets créés', $totalTickets];
        $data[] = ['Tickets résolus', $resolvedTickets];
        $data[] = ['Tickets fermés', $closedTickets];
        $data[] = [''];
        $data[] = ['STATISTIQUES ÉQUIPEMENTS'];
        $data[] = ['Nouveaux équipements', $newEquipment];
        $data[] = [''];
        $data[] = ['PERFORMANCE TECHNICIENS'];
        $data[] = ['Technicien', 'Tickets Assignés', 'Tickets Résolus', 'Taux de Résolution'];

        $technicians = User::where('role_id', 2)->get();
        foreach ($technicians as $tech) {
            $assignedTickets = Ticket::where('technicien_assigne', $tech->id_user)
                                   ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                                   ->count();
            
            $resolvedByTech = Ticket::where('technicien_assigne', $tech->id_user)
                                   ->whereBetween('updated_at', [$startOfMonth, $endOfMonth])
                                   ->whereIn('status', ['resolu', 'ferme'])
                                   ->count();

            $resolutionRate = $assignedTickets > 0 ? round($resolvedByTech / $assignedTickets * 100, 2) : 0;

            $data[] = [
                $tech->prenom . ' ' . $tech->nom,
                $assignedTickets,
                $resolvedByTech,
                $resolutionRate . '%'
            ];
        }

        return $this->downloadCsv($data, 'rapport_mensuel_' . $currentMonth->format('Y_m'));
    }

    private function downloadCsv($data, $filename)
    {
        $output = fopen('php://temp', 'w');
        
        foreach ($data as $row) {
            fputcsv($output, $row, ';'); // Use semicolon for better Excel compatibility
        }
        
        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '_' . date('Y-m-d') . '.csv"',
            'Cache-Control' => 'max-age=0',
        ];

        // Add BOM for proper UTF-8 encoding in Excel
        $csv = "\xEF\xBB\xBF" . $csv;

        return response($csv, 200, $headers);
    }
}
