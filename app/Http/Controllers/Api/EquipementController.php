<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Equipement;
use Illuminate\Http\Request;

class EquipementController extends Controller
{
    /**
     * Afficher tous les équipements
     */
    public function index()
    {
        try {
            $equipements = Equipement::with('typeEquipement')->get();

            return response()->json([
                'success' => true,
                'data' => $equipements,
                'count' => $equipements->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des équipements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher un équipement spécifique
     */
    public function show($id)
    {
        try {
            $equipement = Equipement::with(['typeEquipement', 'tickets', 'pannes'])
                                  ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $equipement
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Équipement non trouvé',
                'error' => $e->getMessage()
            ], 404);
        }
    }
}
