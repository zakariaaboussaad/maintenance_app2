<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Api\EquipementController;
use App\Http\Controllers\Api\UsersController;
use App\Http\Controllers\Api\PanneController;
use App\Http\Controllers\Api\InterventionController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\AuthController; // Fixed: Added Api namespace
use App\Http\Controllers\Api\CategoryController; // Added CategoryController

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Authentication routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/login', [AuthController::class, 'login']); // Keep both for compatibility
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::get('/user', [AuthController::class, 'me']);
});

// Test routes
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
        ],
        'available_routes' => [
            'POST /api/auth/login - Connexion utilisateur',
            'POST /api/login - Connexion (alias)',
            'GET /api/test - Test de l\'API',
            'GET /api/db-test - Test base de données',
            'GET /api/equipements - Liste des équipements',
            'GET /api/create-user - Créer utilisateur admin (dev only)'
        ]
    ]);
});

// Database connection test
Route::get('/db-test', function () {
    try {
        \DB::connection()->getPdo();

        $userCount = \App\Models\User::count();
        $equipmentCount = \App\Models\Equipement::count();

        return response()->json([
            'success' => true,
            'message' => '✅ Base de données connectée !',
            'database' => config('database.connections.mysql.database'),
            'host' => config('database.connections.mysql.host'),
            'stats' => [
                'users' => $userCount,
                'equipments' => $equipmentCount
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => '❌ Erreur de connexion à la base de données',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Reset demo data (equipements + tickets) but keep users intact
Route::get('/reset-demo-data', function () {
    try {
        \DB::beginTransaction();

        // Disable foreign key checks for truncate operations
        \DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        \DB::table('tickets')->truncate();
        \DB::table('equipements')->truncate();
        \DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Seed sample equipments assigned to existing demo users
        $now = now();
        \DB::table('equipements')->insert([
            [
                'numero_serie' => 'PC-001',
                'modele' => 'OptiPlex 3080',
                'marque' => 'Dell',
                'os' => 'Windows 11',
                'date_installation' => $now->copy()->subYear(),
                'status' => 'Actif',
                'localisation' => 'Bureau Comptabilité',
                'prix_achat' => 950.00,
                'type_equipement_id' => 1,
                'utilisateur_assigne' => 4,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'numero_serie' => 'PRN-001',
                'modele' => 'LaserJet Pro',
                'marque' => 'HP',
                'os' => null,
                'date_installation' => $now->copy()->subMonths(18),
                'status' => 'Actif',
                'localisation' => 'Hall Principal',
                'prix_achat' => 420.00,
                'type_equipement_id' => 4,
                'utilisateur_assigne' => 5,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'numero_serie' => 'SW-001',
                'modele' => 'Catalyst 2960',
                'marque' => 'Cisco',
                'os' => 'IOS',
                'date_installation' => $now->copy()->subYears(2),
                'status' => 'Actif',
                'localisation' => 'Salle Serveur',
                'prix_achat' => 1500.00,
                'type_equipement_id' => 3,
                'utilisateur_assigne' => 5,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'numero_serie' => 'SRV-001',
                'modele' => 'PowerEdge R740',
                'marque' => 'Dell',
                'os' => 'Ubuntu Server 22.04',
                'date_installation' => $now->copy()->subYears(3),
                'status' => 'Actif',
                'localisation' => 'Salle Serveur',
                'prix_achat' => 5200.00,
                'type_equipement_id' => 5,
                'utilisateur_assigne' => 4,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // Ensure categories exist (1..4) expected by UI
        if (!\DB::table('categories')->count()) {
            \DB::table('categories')->insert([
                ['id' => 1, 'nom' => 'Hardware', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
                ['id' => 2, 'nom' => 'Software', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
                ['id' => 3, 'nom' => 'Réseau', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
                ['id' => 4, 'nom' => 'impression', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ]);
        }

        // Seed consistent tickets
        \DB::table('tickets')->insert([
            [
                'titre' => 'PC en panne',
                'description' => "L'ordinateur ne démarre plus.",
                'priorite' => 'normale',
                'status' => 'en_attente',
                'user_id' => 4,
                'equipement_id' => 'PC-001',
                'technicien_assigne' => null,
                'categorie_id' => 1,
                'date_creation' => $now,
                'commentaire_resolution' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'titre' => 'Imprimante bourrage',
                'description' => 'Bourrage papier fréquent.',
                'priorite' => 'normale',
                'status' => 'ouvert',
                'user_id' => 5,
                'equipement_id' => 'PRN-001',
                'technicien_assigne' => null,
                'categorie_id' => 4,
                'date_creation' => $now,
                'commentaire_resolution' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'titre' => 'Switch instable',
                'description' => 'Perte de connectivité intermittente.',
                'priorite' => 'normale',
                'status' => 'resolu',
                'user_id' => 5,
                'equipement_id' => 'SW-001',
                'technicien_assigne' => 2,
                'categorie_id' => 3,
                'date_creation' => $now->copy()->subDays(2),
                'commentaire_resolution' => 'Mise à jour du firmware + redémarrage.',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'titre' => 'Serveur lent',
                'description' => 'Temps de réponse très long.',
                'priorite' => 'haute',
                'status' => 'en_cours',
                'user_id' => 4,
                'equipement_id' => 'SRV-001',
                'technicien_assigne' => 2,
                'categorie_id' => 1,
                'date_creation' => $now->copy()->subDay(),
                'commentaire_resolution' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        \DB::commit();

        return response()->json([
            'success' => true,
            'message' => '✅ Données de démonstration réinitialisées (équipements + tickets). Les utilisateurs ont été conservés.',
        ]);
    } catch (\Exception $e) {
        \DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => '❌ Échec de la réinitialisation',
            'error' => $e->getMessage(),
        ], 500);
    }
});

// Seed 10 equipments (5 -> user 4, 5 -> user 5) and 4 tickets
Route::get('/seed-basic-data', function () {
    try {
        $now = now();

        // Ensure categories exist (1..4)
        if (!\DB::table('categories')->count()) {
            \DB::table('categories')->insert([
                ['id' => 1, 'nom' => 'Hardware', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
                ['id' => 2, 'nom' => 'Software', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
                ['id' => 3, 'nom' => 'Réseau', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
                ['id' => 4, 'nom' => 'impression', 'is_active' => 1, 'created_at' => $now, 'updated_at' => $now],
            ]);
        }

        // Build 10 equipments
        $equipements = [];
        $equipements[] = [
            'numero_serie' => 'U4-PC-001', 'modele' => 'OptiPlex 3080', 'marque' => 'Dell', 'os' => 'Windows 11',
            'date_installation' => $now->copy()->subMonths(18), 'status' => 'Actif', 'localisation' => 'Comptabilité',
            'prix_achat' => 900.00, 'type_equipement_id' => 1, 'utilisateur_assigne' => 4, 'created_at' => $now, 'updated_at' => $now,
        ];
        $equipements[] = [
            'numero_serie' => 'U4-PC-002', 'modele' => 'EliteDesk 800', 'marque' => 'HP', 'os' => 'Windows 11',
            'date_installation' => $now->copy()->subYear(), 'status' => 'Actif', 'localisation' => 'Comptabilité',
            'prix_achat' => 1100.00, 'type_equipement_id' => 1, 'utilisateur_assigne' => 4, 'created_at' => $now, 'updated_at' => $now,
        ];
        $equipements[] = [
            'numero_serie' => 'U4-SRV-001', 'modele' => 'PowerEdge R740', 'marque' => 'Dell', 'os' => 'Ubuntu Server 22.04',
            'date_installation' => $now->copy()->subYears(2), 'status' => 'Actif', 'localisation' => 'Salle Serveur',
            'prix_achat' => 5200.00, 'type_equipement_id' => 5, 'utilisateur_assigne' => 4, 'created_at' => $now, 'updated_at' => $now,
        ];
        $equipements[] = [
            'numero_serie' => 'U4-PRN-001', 'modele' => 'LaserJet Pro', 'marque' => 'HP', 'os' => null,
            'date_installation' => $now->copy()->subMonths(6), 'status' => 'Actif', 'localisation' => 'Accueil',
            'prix_achat' => 420.00, 'type_equipement_id' => 4, 'utilisateur_assigne' => 4, 'created_at' => $now, 'updated_at' => $now,
        ];
        $equipements[] = [
            'numero_serie' => 'U4-SW-001', 'modele' => 'Catalyst 2960', 'marque' => 'Cisco', 'os' => 'IOS',
            'date_installation' => $now->copy()->subYears(3), 'status' => 'Actif', 'localisation' => 'Salle Serveur',
            'prix_achat' => 1500.00, 'type_equipement_id' => 3, 'utilisateur_assigne' => 4, 'created_at' => $now, 'updated_at' => $now,
        ];

        // 5 for user 5 (Aicha)
        $equipements[] = [
            'numero_serie' => 'U5-PC-001', 'modele' => 'ThinkCentre M720', 'marque' => 'Lenovo', 'os' => 'Windows 10',
            'date_installation' => $now->copy()->subMonths(20), 'status' => 'Actif', 'localisation' => 'RH',
            'prix_achat' => 800.00, 'type_equipement_id' => 1, 'utilisateur_assigne' => 5, 'created_at' => $now, 'updated_at' => $now,
        ];
        $equipements[] = [
            'numero_serie' => 'U5-PC-002', 'modele' => 'MacBook Pro 14', 'marque' => 'Apple', 'os' => 'macOS',
            'date_installation' => $now->copy()->subMonths(8), 'status' => 'Actif', 'localisation' => 'RH',
            'prix_achat' => 2100.00, 'type_equipement_id' => 1, 'utilisateur_assigne' => 5, 'created_at' => $now, 'updated_at' => $now,
        ];
        $equipements[] = [
            'numero_serie' => 'U5-SW-001', 'modele' => 'EdgeSwitch 24', 'marque' => 'Ubiquiti', 'os' => 'EdgeOS',
            'date_installation' => $now->copy()->subYears(1), 'status' => 'Actif', 'localisation' => 'Open space',
            'prix_achat' => 600.00, 'type_equipement_id' => 3, 'utilisateur_assigne' => 5, 'created_at' => $now, 'updated_at' => $now,
        ];
        $equipements[] = [
            'numero_serie' => 'U5-PRN-001', 'modele' => 'EcoTank L3150', 'marque' => 'Epson', 'os' => null,
            'date_installation' => $now->copy()->subMonths(3), 'status' => 'Actif', 'localisation' => 'RH',
            'prix_achat' => 250.00, 'type_equipement_id' => 4, 'utilisateur_assigne' => 5, 'created_at' => $now, 'updated_at' => $now,
        ];
        $equipements[] = [
            'numero_serie' => 'U5-PC-003', 'modele' => 'Pavilion 15', 'marque' => 'HP', 'os' => 'Windows 11',
            'date_installation' => $now->copy()->subMonths(10), 'status' => 'Actif', 'localisation' => 'RH',
            'prix_achat' => 700.00, 'type_equipement_id' => 1, 'utilisateur_assigne' => 5, 'created_at' => $now, 'updated_at' => $now,
        ];

        \DB::table('equipements')->insert($equipements);

        // 4 tickets (2 pour user 4, 2 pour user 5)
        $tickets = [
            [
                'titre' => 'PC ne démarre pas', 'description' => "Écran noir au démarrage.", 'priorite' => 'normale', 'status' => 'ouvert',
                'user_id' => 4, 'equipement_id' => 'U4-PC-001', 'technicien_assigne' => null, 'categorie_id' => 1,
                'date_creation' => $now->copy(), 'commentaire_resolution' => null, 'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'titre' => 'Imprimante HS', 'description' => 'Bourrage récurrent.', 'priorite' => 'normale', 'status' => 'en_attente',
                'user_id' => 4, 'equipement_id' => 'U4-PRN-001', 'technicien_assigne' => null, 'categorie_id' => 4,
                'date_creation' => $now->copy(), 'commentaire_resolution' => null, 'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'titre' => 'Mise à jour macOS', 'description' => 'Demande de mise à jour système.', 'priorite' => 'basse', 'status' => 'ouvert',
                'user_id' => 5, 'equipement_id' => 'U5-PC-002', 'technicien_assigne' => 2, 'categorie_id' => 2,
                'date_creation' => $now->copy(), 'commentaire_resolution' => null, 'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'titre' => 'Perte réseau', 'description' => 'Connexion instable sur l’open space.', 'priorite' => 'haute', 'status' => 'en_cours',
                'user_id' => 5, 'equipement_id' => 'U5-SW-001', 'technicien_assigne' => 3, 'categorie_id' => 3,
                'date_creation' => $now->copy(), 'commentaire_resolution' => null, 'created_at' => $now, 'updated_at' => $now,
            ],
        ];

        \DB::table('tickets')->insert($tickets);

        return response()->json(['success' => true, 'message' => '✅ 10 équipements et 4 tickets ajoutés.']);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'message' => '❌ Échec du seed', 'error' => $e->getMessage()], 500);
    }
});

// Create admin user for testing
Route::get('/create-user', function () {
    try {
        $user = \App\Models\User::firstOrCreate(
            ['email' => 'admin@onee.ma'],
            [
                'nom' => 'Markar',
                'prenom' => 'Aboussaad',
                'name' => 'Aboussaad Markar', // Add name field
                'matricule' => 'ADM001',
                'password' => Hash::make('password123'),
                'numero_telephone' => '0600000000',
                'poste_affecte' => 'Bureau Principal',
                'role_id' => 1,
                'is_active' => true,
                'date_embauche' => now(),
            ]
        );

        // Also create simpler test users
        \App\Models\User::firstOrCreate(
            ['email' => 'admin@onee.com'],
            [
                'name' => 'Admin ONEE',
                'password' => Hash::make('123456'),
                'role_id' => 1,
            ]
        );

        \App\Models\User::firstOrCreate(
            ['email' => 'technicien@onee.com'],
            [
                'name' => 'Technicien Maintenance',
                'password' => Hash::make('123456'),
                'role_id' => 2,
            ]
        );

        \App\Models\User::firstOrCreate(
            ['email' => 'user@onee.com'],
            [
                'name' => 'Utilisateur Test',
                'password' => Hash::make('123456'),
                'role_id' => 3,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Users created successfully!',
            'test_accounts' => [
                ['email' => 'admin@onee.ma', 'password' => 'password123', 'role' => 'Admin'],
                ['email' => 'admin@onee.com', 'password' => '123456', 'role' => 'Admin'],
                ['email' => 'technicien@onee.com', 'password' => '123456', 'role' => 'Technicien'],
                ['email' => 'user@onee.com', 'password' => '123456', 'role' => 'Utilisateur']
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error creating user',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Resource routes
Route::middleware(['api'])->group(function () {
    // Equipements routes
    Route::get('/equipements', [EquipementController::class, 'index']);
    Route::get('/equipements/user/{userId}', [EquipementController::class, 'getUserEquipements']);
    Route::get('/equipements/{id}', [EquipementController::class, 'show']);

    // Utilisateurs routes
    Route::get('/utilisateurs', [UsersController::class, 'index']);
    Route::get('/utilisateurs/{id}', [UsersController::class, 'show']);

    // Pannes routes
    Route::get('/pannes', [PanneController::class, 'index']);
    Route::get('/pannes/{id}', [PanneController::class, 'show']);

    // Tickets routes
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::get('/tickets/user/{userId}', [TicketController::class, 'getUserTickets']);
    Route::get('/tickets/technician/{technicianId}', [TicketController::class, 'getTechnicianTickets']);
    Route::get('/tickets/{id}', [TicketController::class, 'show']);
    Route::put('/tickets/{id}', [TicketController::class, 'update']);
    Route::get('/tickets/{id}/check-assignment', [TicketController::class, 'checkAssignment']);
    Route::post('/tickets/{id}/assign', [TicketController::class, 'assign']);

    // Categories routes
    Route::get('/categories', [CategoryController::class, 'index']);

    // Interventions routes
    Route::get('/interventions', [InterventionController::class, 'index']);
    Route::get('/interventions/{id}', [InterventionController::class, 'show']);

    // Notifications routes
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/{id}', [NotificationController::class, 'show']);
});

// Dashboard stats
Route::get('/dashboard-stats', function () {
    try {
        $stats = [
            'equipments' => \App\Models\Equipement::count(),
            'tickets' => \App\Models\Ticket::count(),
            'interventions' => \App\Models\Intervention::count(),
            'users' => \App\Models\User::count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error fetching dashboard stats',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Create test equipment data
Route::get('/create-test-data', function () {
    try {
        // Create equipment types if they don't exist
        $compressorType = \App\Models\TypeEquipement::firstOrCreate(
            ['nom_type' => 'Compresseur'], // Use nom_type based on your model
            ['description' => 'Équipements de compression']
        );

        $pumpType = \App\Models\TypeEquipement::firstOrCreate(
            ['nom_type' => 'Pompe'],
            ['description' => 'Pompes hydrauliques']
        );

        $motorType = \App\Models\TypeEquipement::firstOrCreate(
            ['nom_type' => 'Moteur'],
            ['description' => 'Moteurs électriques']
        );

        // Create equipment
        \App\Models\Equipement::firstOrCreate(
            ['numero_serie' => 'COMP-001'],
            [
                'modele' => 'Compresseur Principal',
                'marque' => 'Atlas Copco',
                'localisation' => 'Atelier A',
                'type_equipement_id' => $compressorType->id,
                'status' => 'Actif',
                'date_installation' => now()->subYears(2),
                'os' => null
            ]
        );

        \App\Models\Equipement::firstOrCreate(
            ['numero_serie' => 'PUMP-002'],
            [
                'modele' => 'Pompe Hydraulique',
                'marque' => 'Grundfos',
                'localisation' => 'Atelier B',
                'type_equipement_id' => $pumpType->id,
                'status' => 'En maintenance',
                'date_installation' => now()->subYears(1),
                'os' => null
            ]
        );

        \App\Models\Equipement::firstOrCreate(
            ['numero_serie' => 'MOTOR-003'],
            [
                'modele' => 'Moteur Électrique',
                'marque' => 'ABB',
                'localisation' => 'Atelier C',
                'type_equipement_id' => $motorType->id,
                'status' => 'Actif',
                'date_installation' => now()->subMonths(6),
                'os' => null
            ]
        );

        return response()->json([
            'success' => true,
            'message' => '✅ Données de test créées avec succès!',
            'data' => [
                'equipment_types' => 3,
                'equipments' => 3
            ]
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => '❌ Erreur lors de la création des données de test',
            'error' => $e->getMessage()
        ], 500);
    }
});
