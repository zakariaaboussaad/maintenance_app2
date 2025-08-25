<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Font;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Color;
use App\Models\Equipement;
use App\Models\User;
use App\Models\Ticket;
use Carbon\Carbon;

class ExcelExportController extends Controller
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
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Équipements Complets');

        // Add company header first
        $this->addCompanyHeader($sheet, 'RAPPORT ÉQUIPEMENTS COMPLETS', 'A', 'I');
        
        // Set headers
        $sheet->setCellValue('A4', 'Modèle');
        $sheet->setCellValue('B4', 'Marque');
        $sheet->setCellValue('C4', 'Numéro de Série');
        $sheet->setCellValue('D4', 'Statut');
        $sheet->setCellValue('E4', 'Utilisateur Assigné');
        $sheet->setCellValue('F4', 'Email Utilisateur');
        $sheet->setCellValue('G4', 'Date d\'Installation');
        $sheet->setCellValue('H4', 'Date de Création');
        $sheet->setCellValue('I4', 'Dernière Mise à Jour');

        // Style headers
        $this->styleHeaders($sheet, 'A4:I4');

        // Get equipment data with user relationships
        $equipments = Equipement::with('utilisateurAssigne')->get();
        $row = 5;

        foreach ($equipments as $equipment) {
            $sheet->setCellValue('A' . $row, $equipment->modele ?? '');
            $sheet->setCellValue('B' . $row, $equipment->marque ?? '');
            $sheet->setCellValue('C' . $row, $equipment->numero_serie ?? '');
            $sheet->setCellValue('D' . $row, $equipment->status ?? '');
            $sheet->setCellValue('E' . $row, $equipment->utilisateurAssigne ? ($equipment->utilisateurAssigne->prenom . ' ' . $equipment->utilisateurAssigne->nom) : 'Non assigné');
            $sheet->setCellValue('F' . $row, $equipment->utilisateurAssigne ? $equipment->utilisateurAssigne->email : '');
            $sheet->setCellValue('G' . $row, $equipment->date_installation ? $equipment->date_installation->format('d/m/Y') : '');
            $sheet->setCellValue('H' . $row, $equipment->created_at ? $equipment->created_at->format('d/m/Y H:i') : '');
            $sheet->setCellValue('I' . $row, $equipment->updated_at ? $equipment->updated_at->format('d/m/Y H:i') : '');
            
            // Style status cell based on status
            if ($equipment->status) {
                $this->styleStatusCell($sheet, 'D' . $row, $equipment->status);
            }
            
            // Alternate row colors
            if ($row % 2 == 0) {
                $this->styleAlternateRow($sheet, 'A' . $row . ':I' . $row);
            }
            
            $row++;
        }
        
        // Add borders to data range
        $this->addBorders($sheet, 'A4:I' . ($row - 1));

        // Auto-size columns
        foreach (range('A', 'I') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        return $this->downloadSpreadsheet($spreadsheet, 'equipements_complets');
    }

    public function exportEquipmentOnly(Request $request)
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Équipements');

        // Add company header first
        $this->addCompanyHeader($sheet, 'RAPPORT ÉQUIPEMENTS SIMPLIFIÉS', 'A', 'D');
        
        // Headers
        $headers = [
            'A4' => 'Nom',
            'B4' => 'Type',
            'C4' => 'Numéro de Série',
            'D4' => 'Statut'
        ];

        foreach ($headers as $cell => $value) {
            $sheet->setCellValue($cell, $value);
        }

        // Style headers
        $this->styleHeaders($sheet, 'A4:D4');

        // Get equipment data
        $equipments = Equipement::all();
        $row = 5;

        foreach ($equipments as $equipment) {
            $sheet->setCellValue('A' . $row, $equipment->modele);
            $sheet->setCellValue('B' . $row, $equipment->marque);
            $sheet->setCellValue('C' . $row, $equipment->numero_serie);
            $sheet->setCellValue('D' . $row, $equipment->status);
            
            // Style status cell
            $this->styleStatusCell($sheet, 'D' . $row, $equipment->status);
            
            // Alternate row colors
            if ($row % 2 == 0) {
                $this->styleAlternateRow($sheet, 'A' . $row . ':D' . $row);
            }
            
            $row++;
        }
        
        // Add borders
        $this->addBorders($sheet, 'A4:D' . ($row - 1));

        // Auto-size columns
        foreach (range('A', 'D') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        return $this->downloadSpreadsheet($spreadsheet, 'equipements');
    }

    public function exportUsers(Request $request)
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Utilisateurs');

        // Set headers
        $headers = [
            'A4' => 'Nom',
            'B4' => 'Prénom',
            'C4' => 'Email',
            'D4' => 'Téléphone',
            'E4' => 'Rôle',
            'F4' => 'Date de Création',
            'G4' => 'Dernière Connexion'
        ];

        foreach ($headers as $cell => $value) {
            $sheet->setCellValue($cell, $value);
        }

        // Style headers
        $this->styleHeaders($sheet, 'A4:G4');
        
        // Add company header
        $this->addCompanyHeader($sheet, 'RAPPORT UTILISATEURS', 'A', 'G');

        // Get users data
        $users = User::all();
        $row = 5;

        foreach ($users as $user) {
            $sheet->setCellValue('A' . $row, $user->nom);
            $sheet->setCellValue('B' . $row, $user->prenom);
            $sheet->setCellValue('C' . $row, $user->email);
            $sheet->setCellValue('D' . $row, $user->numero_telephone);
            $sheet->setCellValue('E' . $row, $user->getRoleNameAttribute());
            $sheet->setCellValue('F' . $row, $user->created_at->format('d/m/Y H:i'));
            $sheet->setCellValue('G' . $row, $user->last_login_at ? $user->last_login_at->format('d/m/Y H:i') : 'Jamais');
            
            // Style role cell based on role
            $this->styleRoleCell($sheet, 'E' . $row, $user->getRoleNameAttribute());
            
            // Alternate row colors
            if ($row % 2 == 0) {
                $this->styleAlternateRow($sheet, 'A' . $row . ':G' . $row);
            }
            
            $row++;
        }
        
        // Add borders
        $this->addBorders($sheet, 'A4:G' . ($row - 1));

        // Auto-size columns
        foreach (range('A', 'G') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        return $this->downloadSpreadsheet($spreadsheet, 'utilisateurs');
    }

    public function exportTickets(Request $request)
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Tickets');

        // Set headers
        $headers = [
            'A4' => 'Titre',
            'B4' => 'Description',
            'C4' => 'Statut',
            'D4' => 'Priorité',
            'E4' => 'Créateur',
            'F4' => 'Technicien',
            'G4' => 'Date de Création',
            'H4' => 'Date de Mise à Jour'
        ];

        foreach ($headers as $cell => $value) {
            $sheet->setCellValue($cell, $value);
        }

        // Style headers
        $this->styleHeaders($sheet, 'A4:H4');
        
        // Add company header
        $this->addCompanyHeader($sheet, 'RAPPORT TICKETS', 'A', 'H');

        // Get tickets data
        $tickets = Ticket::with(['user', 'technician'])->get();
        $row = 5;

        foreach ($tickets as $ticket) {
            $sheet->setCellValue('A' . $row, $ticket->titre);
            $sheet->setCellValue('B' . $row, $ticket->description);
            $sheet->setCellValue('C' . $row, $ticket->statut);
            $sheet->setCellValue('D' . $row, $ticket->priorite);
            $sheet->setCellValue('E' . $row, $ticket->user ? $ticket->user->nom . ' ' . $ticket->user->prenom : 'N/A');
            $sheet->setCellValue('F' . $row, $ticket->technician ? $ticket->technician->nom . ' ' . $ticket->technician->prenom : 'Non assigné');
            $sheet->setCellValue('G' . $row, $ticket->created_at->format('d/m/Y H:i'));
            $sheet->setCellValue('H' . $row, $ticket->updated_at->format('d/m/Y H:i'));
            
            // Style status cell based on status
            $this->styleStatusCell($sheet, 'C' . $row, $ticket->statut);
            
            // Style priority cell based on priority
            $this->stylePriorityCell($sheet, 'D' . $row, $ticket->priorite);
            
            // Alternate row colors
            if ($row % 2 == 0) {
                $this->styleAlternateRow($sheet, 'A' . $row . ':H' . $row);
            }
            
            $row++;
        }
        
        // Add borders
        $this->addBorders($sheet, 'A4:H' . ($row - 1));

        // Auto-size columns
        foreach (range('A', 'H') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        return $this->downloadSpreadsheet($spreadsheet, 'tickets');
    }

    public function exportMonthlyReport(Request $request)
    {
        $spreadsheet = new Spreadsheet();
        
        // Current month data
        $currentMonth = Carbon::now();
        $startOfMonth = $currentMonth->copy()->startOfMonth();
        $endOfMonth = $currentMonth->copy()->endOfMonth();

        // Sheet 1: Summary
        $summarySheet = $spreadsheet->getActiveSheet();
        $summarySheet->setTitle('Résumé Mensuel');
        
        $this->createSummarySheet($summarySheet, $startOfMonth, $endOfMonth);

        // Sheet 2: Tickets by Technician
        $techSheet = $spreadsheet->createSheet();
        $techSheet->setTitle('Tickets par Technicien');
        
        $this->createTechnicianSheet($techSheet, $startOfMonth, $endOfMonth);

        // Sheet 3: New Equipment
        $equipSheet = $spreadsheet->createSheet();
        $equipSheet->setTitle('Nouveaux Équipements');
        
        $this->createEquipmentSheet($equipSheet, $startOfMonth, $endOfMonth);

        // Sheet 4: User Activity
        $userSheet = $spreadsheet->createSheet();
        $userSheet->setTitle('Activité Utilisateurs');
        
        $this->createUserActivitySheet($userSheet, $startOfMonth, $endOfMonth);

        $spreadsheet->setActiveSheetIndex(0);

        return $this->downloadSpreadsheet($spreadsheet, 'rapport_mensuel_' . $currentMonth->format('Y_m'));
    }

    private function createSummarySheet($sheet, $startOfMonth, $endOfMonth)
    {
        // Add company header
        $this->addCompanyHeader($sheet, 'RAPPORT MENSUEL - ' . strtoupper($startOfMonth->format('F Y')), 'A', 'D');

        $row = 4;
        
        // Tickets statistics
        $totalTickets = Ticket::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();
        $resolvedTickets = Ticket::whereBetween('updated_at', [$startOfMonth, $endOfMonth])
                                ->where('status', 'resolu')->count();
        $closedTickets = Ticket::whereBetween('updated_at', [$startOfMonth, $endOfMonth])
                               ->where('status', 'ferme')->count();
        $pendingTickets = Ticket::where('status', 'en_attente')->count();

        $sheet->setCellValue('A' . $row, 'STATISTIQUES TICKETS');
        $sheet->getStyle('A' . $row)->getFont()->setBold(true);
        $row++;

        $sheet->setCellValue('A' . $row, 'Nouveaux tickets créés:');
        $sheet->setCellValue('B' . $row, $totalTickets);
        $row++;

        $sheet->setCellValue('A' . $row, 'Tickets résolus:');
        $sheet->setCellValue('B' . $row, $resolvedTickets);
        $row++;

        $sheet->setCellValue('A' . $row, 'Tickets fermés:');
        $sheet->setCellValue('B' . $row, $closedTickets);
        $row++;

        $sheet->setCellValue('A' . $row, 'Tickets en attente:');
        $sheet->setCellValue('B' . $row, $pendingTickets);
        $row += 2;

        // Equipment statistics
        $newEquipment = Equipement::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();
        $totalEquipment = Equipement::count();

        $sheet->setCellValue('A' . $row, 'STATISTIQUES ÉQUIPEMENTS');
        $sheet->getStyle('A' . $row)->getFont()->setBold(true);
        $row++;

        $sheet->setCellValue('A' . $row, 'Nouveaux équipements:');
        $sheet->setCellValue('B' . $row, $newEquipment);
        $row++;

        $sheet->setCellValue('A' . $row, 'Total équipements:');
        $sheet->setCellValue('B' . $row, $totalEquipment);

        foreach (range('A', 'D') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }
    }

    private function createTechnicianSheet($sheet, $startOfMonth, $endOfMonth)
    {
        $headers = [
            'A1' => 'Technicien',
            'B1' => 'Tickets Assignés',
            'C1' => 'Tickets Résolus',
            'D1' => 'Tickets Fermés',
            'E1' => 'Taux de Résolution (%)'
        ];

        foreach ($headers as $cell => $value) {
            $sheet->setCellValue($cell, $value);
        }

        $this->styleHeaders($sheet, 'A1:E1');

        $technicians = User::where('role_id', 2)->get();
        $row = 2;

        foreach ($technicians as $tech) {
            $assignedTickets = Ticket::where('technicien_assigne', $tech->id_user)
                                   ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                                   ->count();
            
            $resolvedTickets = Ticket::where('technicien_assigne', $tech->id_user)
                                   ->whereBetween('updated_at', [$startOfMonth, $endOfMonth])
                                   ->where('status', 'resolu')
                                   ->count();
            
            $closedTickets = Ticket::where('technicien_assigne', $tech->id_user)
                                 ->whereBetween('updated_at', [$startOfMonth, $endOfMonth])
                                 ->where('status', 'ferme')
                                 ->count();

            $resolutionRate = $assignedTickets > 0 ? round(($resolvedTickets + $closedTickets) / $assignedTickets * 100, 2) : 0;

            $sheet->setCellValue('A' . $row, $tech->prenom . ' ' . $tech->nom);
            $sheet->setCellValue('B' . $row, $assignedTickets);
            $sheet->setCellValue('C' . $row, $resolvedTickets);
            $sheet->setCellValue('D' . $row, $closedTickets);
            $sheet->setCellValue('E' . $row, $resolutionRate . '%');
            $row++;
        }

        foreach (range('A', 'E') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }
    }

    private function createEquipmentSheet($sheet, $startOfMonth, $endOfMonth)
    {
        $headers = [
            'A1' => 'Nom',
            'B1' => 'Type',
            'C1' => 'Numéro de Série',
            'D1' => 'Utilisateur Assigné',
            'E1' => 'Date d\'Ajout'
        ];

        foreach ($headers as $cell => $value) {
            $sheet->setCellValue($cell, $value);
        }

        $this->styleHeaders($sheet, 'A1:E1');

        $newEquipments = Equipement::with('utilisateurAssigne')
                                ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                                ->get();
        $row = 2;

        foreach ($newEquipments as $equipment) {
            $sheet->setCellValue('A' . $row, $equipment->modele);
            $sheet->setCellValue('B' . $row, $equipment->marque);
            $sheet->setCellValue('C' . $row, $equipment->numero_serie);
            $sheet->setCellValue('D' . $row, $equipment->utilisateurAssigne ? ($equipment->utilisateurAssigne->prenom . ' ' . $equipment->utilisateurAssigne->nom) : 'Non assigné');
            $sheet->setCellValue('E' . $row, $equipment->created_at->format('d/m/Y'));
            $row++;
        }

        foreach (range('A', 'E') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }
    }

    private function createUserActivitySheet($sheet, $startOfMonth, $endOfMonth)
    {
        $headers = [
            'A1' => 'Utilisateur',
            'B1' => 'Email',
            'C1' => 'Tickets Créés',
            'D1' => 'Dernière Activité'
        ];

        foreach ($headers as $cell => $value) {
            $sheet->setCellValue($cell, $value);
        }

        $this->styleHeaders($sheet, 'A1:D1');

        $users = User::where('role_id', 3)->get();
        $row = 2;

        foreach ($users as $user) {
            $ticketsCreated = Ticket::where('user_id', $user->id_user)
                                  ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                                  ->count();

            $lastActivity = Ticket::where('user_id', $user->id_user)
                                ->latest('created_at')
                                ->first();

            $sheet->setCellValue('A' . $row, $user->prenom . ' ' . $user->nom);
            $sheet->setCellValue('B' . $row, $user->email);
            $sheet->setCellValue('C' . $row, $ticketsCreated);
            $sheet->setCellValue('D' . $row, $lastActivity ? $lastActivity->created_at->format('d/m/Y') : 'Aucune');
            $row++;
        }

        foreach (range('A', 'D') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }
    }

    private function styleHeaders($sheet, $range)
    {
        $sheet->getStyle($range)->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 12
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '2563EB']
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '1E40AF']
                ]
            ]
        ]);
        
        // Set row height for headers
        $headerRow = substr($range, 1, 1);
        $sheet->getRowDimension($headerRow)->setRowHeight(25);
    }
    
    private function addCompanyHeader($sheet, $title, $startCol, $endCol)
    {
        // Insert rows at the top
        $sheet->insertNewRowBefore(1, 3);
        
        // Company name
        $sheet->setCellValue($startCol . '1', 'ONEE - OFFICE NATIONAL DE L\'ÉLECTRICITÉ ET DE L\'EAU POTABLE');
        $sheet->mergeCells($startCol . '1:' . $endCol . '1');
        $sheet->getStyle($startCol . '1')->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 16,
                'color' => ['rgb' => '1E40AF']
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER
            ]
        ]);
        
        // Report title
        $sheet->setCellValue($startCol . '2', $title);
        $sheet->mergeCells($startCol . '2:' . $endCol . '2');
        $sheet->getStyle($startCol . '2')->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 14,
                'color' => ['rgb' => '374151']
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER
            ]
        ]);
        
        // Date
        $sheet->setCellValue($startCol . '3', 'Généré le: ' . date('d/m/Y à H:i'));
        $sheet->mergeCells($startCol . '3:' . $endCol . '3');
        $sheet->getStyle($startCol . '3')->applyFromArray([
            'font' => [
                'italic' => true,
                'size' => 10,
                'color' => ['rgb' => '6B7280']
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER
            ]
        ]);
        
        // Set row heights
        $sheet->getRowDimension('1')->setRowHeight(30);
        $sheet->getRowDimension('2')->setRowHeight(25);
        $sheet->getRowDimension('3')->setRowHeight(20);
    }
    
    private function styleStatusCell($sheet, $cell, $status)
    {
        $colors = [
            // Equipment statuses
            'Actif' => ['bg' => 'D1FAE5', 'text' => '065F46'],
            'En maintenance' => ['bg' => 'FEF3C7', 'text' => '92400E'],
            'Hors service' => ['bg' => 'FEE2E2', 'text' => '991B1B'],
            'En attente' => ['bg' => 'E0E7FF', 'text' => '3730A3'],
            // Ticket statuses
            'en_attente' => ['bg' => 'FEF3C7', 'text' => '92400E'],
            'en_cours' => ['bg' => 'DBEAFE', 'text' => '1E40AF'],
            'resolu' => ['bg' => 'D1FAE5', 'text' => '065F46'],
            'ferme' => ['bg' => 'F3F4F6', 'text' => '374151']
        ];
        
        $color = $colors[$status] ?? ['bg' => 'F3F4F6', 'text' => '374151'];
        
        $sheet->getStyle($cell)->applyFromArray([
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => $color['bg']]
            ],
            'font' => [
                'bold' => true,
                'color' => ['rgb' => $color['text']]
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER
            ]
        ]);
    }
    
    private function styleAlternateRow($sheet, $range)
    {
        $sheet->getStyle($range)->applyFromArray([
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'F9FAFB']
            ]
        ]);
    }
    
    private function addBorders($sheet, $range)
    {
        $sheet->getStyle($range)->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'D1D5DB']
                ],
                'outline' => [
                    'borderStyle' => Border::BORDER_MEDIUM,
                    'color' => ['rgb' => '374151']
                ]
            ]
        ]);
    }
    
    
    private function stylePriorityCell($sheet, $cell, $priority)
    {
        $colors = [
            'faible' => ['bg' => 'D1FAE5', 'text' => '065F46'],
            'normale' => ['bg' => 'DBEAFE', 'text' => '1E40AF'],
            'elevee' => ['bg' => 'FED7D7', 'text' => '991B1B'],
            'critique' => ['bg' => 'FCA5A5', 'text' => '7F1D1D']
        ];
        
        $color = $colors[$priority] ?? ['bg' => 'F3F4F6', 'text' => '374151'];
        
        $sheet->getStyle($cell)->applyFromArray([
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => $color['bg']]
            ],
            'font' => [
                'bold' => true,
                'color' => ['rgb' => $color['text']]
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER
            ]
        ]);
    }
    
    private function styleRoleCell($sheet, $cell, $role)
    {
        $colors = [
            'Admin' => ['bg' => 'FED7D7', 'text' => '991B1B'],
            'Technicien' => ['bg' => 'DBEAFE', 'text' => '1E40AF'],
            'Utilisateur' => ['bg' => 'D1FAE5', 'text' => '065F46']
        ];
        
        $color = $colors[$role] ?? ['bg' => 'F3F4F6', 'text' => '374151'];
        
        $sheet->getStyle($cell)->applyFromArray([
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => $color['bg']]
            ],
            'font' => [
                'bold' => true,
                'color' => ['rgb' => $color['text']]
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER
            ]
        ]);
    }

    private function downloadSpreadsheet($spreadsheet, $filename)
    {
        $writer = new Xlsx($spreadsheet);
        
        $tempFile = tempnam(sys_get_temp_dir(), 'excel_export');
        $writer->save($tempFile);
        
        $headers = [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $filename . '_' . date('Y-m-d') . '.xlsx"',
            'Cache-Control' => 'max-age=0',
        ];

        return response()->download($tempFile, $filename . '_' . date('Y-m-d') . '.xlsx', $headers)->deleteFileAfterSend(true);
    }
}
