<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Panne;
use Illuminate\Http\Request;

class PanneController extends Controller
{
    /**
     * Afficher tous les Pannes
     */
    public function index()
    {
        try {
            $panne = Panne::with('equipement')->get();

            return response()->json([
                'success' => true,
                'data' => $panne,
                'count' => $panne->count()
            ]);
        } catch (\Exception $p) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des Pannes',
                'error' => $p->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher une panne spécifique
     */
    public function show($id)
    {
        try {
            $panne = Panne::with(['typePanne', 'equipement', 'statusPanne'])
                                  ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $panne
            ]);
        } catch (\Exception $p) {
            return response()->json([
                'success' => false,
                'message' => 'Panne non trouvé',
                'error' => $p->getMessage()
            ], 404);
        }
    }
}
