<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EquipementController;
// Route de test API
Route::get('/test', function () {
    return response()->json([
        'success' => true,
        'message' => '🎉 API Laravel fonctionne parfaitement !',
        'timestamp' => now()->format('Y-m-d H:i:s'),
        'project' => 'maintenance-simple',
        'stack' => [
            'frontend' => 'React + Vite',
            'backend' => 'Laravel 11',
            'database' => 'MySQL (XAMPP)'
        ]
    ]);
});

// Route de test base de données
Route::get('/db-test', function () {
    try {
        // Test de connexion à la base de données
        \DB::connection()->getPdo();

        return response()->json([
            'success' => true,
            'message' => '✅ Base de données connectée !',
            'database' => config('database.connections.mysql.database'),
            'host' => config('database.connections.mysql.host')
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => '❌ Erreur de connexion à la base de données',
            'error' => $e->getMessage()
        ], 500);
    }
});
// Add these routes at the end of the file
Route::get('/equipements', [EquipementController::class, 'index']);
Route::get('/equipements/{id}', [EquipementController::class, 'show']);

// Temporary route to create test data
Route::get('/create-test-data', function () {
    // Create equipment types
    \App\Models\TypeEquipement::create(['name' => 'Compresseur', 'description' => 'Équipements de compression']);
    \App\Models\TypeEquipement::create(['name' => 'Pompe', 'description' => 'Pompes hydrauliques']);
    \App\Models\TypeEquipement::create(['name' => 'Moteur', 'description' => 'Moteurs électriques']);

    // Create equipment
    \App\Models\Equipement::create([
        'name' => 'Compresseur Principal',
        'code' => 'COMP-001',
        'location' => 'Atelier A',
        'description' => 'Compresseur principal',
        'type_equipement_id' => 1,
        'status' => 'active'
    ]);

    \App\Models\Equipement::create([
        'name' => 'Pompe Hydraulique',
        'code' => 'PUMP-002',
        'location' => 'Atelier B',
        'description' => 'Pompe hydraulique',
        'type_equipement_id' => 2,
        'status' => 'maintenance'
    ]);

    return response()->json(['message' => 'Test data created!']);
});
