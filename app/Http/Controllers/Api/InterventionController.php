<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Intervention;
use Illuminate\Http\Request;

class InterventionController extends Controller
{
    /**
     * Afficher tous les Intervention
     */
    public function index()
    {
        try {
            $interventions = Intervention::with('tickets')->get();

            return response()->json([
                'success' => true,
                'data' => $interventions,
                'count' => $interventions->count()
            ]);
        } catch (\Exception $i) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des interventions',
                'error' => $i->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher une intervention spécifique
     */
    public function show($id)
    {
        try {
            $intervention = Intervention::with(['categorie', 'tickets', 'pannes', 'user'])
                                  ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $intervention
            ]);
        } catch (\Exception $i) {
            return response()->json([
                'success' => false,
                'message' => 'Intervention non trouvé',
                'error' => $i->getMessage()
            ], 404);
        }
    }
}
