<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UltraSimpleExportController extends Controller
{
    public function exportEquipment()
    {
        $csvData = "Nom,Type,Numero de Serie,Statut\n";
        $csvData .= "Test Equipment,Test Type,TEST001,Actif\n";
        $csvData .= "Sample Device,Sample Type,SAMPLE002,En maintenance\n";

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="equipements_test.csv"',
            'Cache-Control' => 'max-age=0',
        ];

        return response("\xEF\xBB\xBF" . $csvData, 200, $headers);
    }

    public function exportUsers()
    {
        $csvData = "Nom,Prenom,Email,Telephone,Role\n";
        $csvData .= "Doe,John,john@test.com,123456789,Administrateur\n";
        $csvData .= "Smith,Jane,jane@test.com,987654321,Utilisateur\n";

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="utilisateurs_test.csv"',
            'Cache-Control' => 'max-age=0',
        ];

        return response("\xEF\xBB\xBF" . $csvData, 200, $headers);
    }

    public function exportTickets()
    {
        $csvData = "ID,Titre,Description,Statut,Priorite\n";
        $csvData .= "1,Test Ticket,Test Description,Ouvert,Haute\n";
        $csvData .= "2,Sample Issue,Sample Description,Ferme,Moyenne\n";

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="tickets_test.csv"',
            'Cache-Control' => 'max-age=0',
        ];

        return response("\xEF\xBB\xBF" . $csvData, 200, $headers);
    }
}
