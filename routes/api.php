<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Api\EquipementController;
use App\Http\Controllers\Api\UsersController;
use App\Http\Controllers\Api\PanneController;
use App\Http\Controllers\Api\InterventionController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\AuthController; // Fixed: Added Api namespace
use App\Http\Controllers\Api\CategoryController; // Added CategoryController

// Debug route for database connection testing
Route::get('/debug/db', function () {
    try {
        // Test database connection
        $connection = DB::connection()->getPdo();
        $dbname = DB::connection()->getDatabaseName();

        // Test tickets table
        $tables = DB::select('SHOW TABLES');
        $tables = array_map('current', (array) $tables);

        $ticketColumns = [];
        if (in_array('tickets', $tables)) {
            $ticketColumns = DB::select('DESCRIBE tickets');
        }

        return response()->json([
            'connection' => 'Successfully connected to the database',
            'database' => $dbname,
            'tables' => $tables,
            'tickets_columns' => $ticketColumns,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'connection' => [
                'driver' => config('database.default'),
                'host' => config('database.connections.mysql.host'),
                'port' => config('database.connections.mysql.port'),
                'database' => config('database.connections.mysql.database'),
                'username' => config('database.connections.mysql.username'),
            ],
        ], 500);
    }
});




/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Authentication routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/login', [AuthController::class, 'login']); // Keep both for compatibility

// Forgot password routes (no auth required)
Route::post('/forgot-password/verify', [App\Http\Controllers\DefaultPasswordController::class, 'verifyForgotPassword']);
Route::post('/forgot-password/reset', [App\Http\Controllers\DefaultPasswordController::class, 'resetPassword']);

// Default password management routes (Admin only)
Route::get('/admin/default-password/info', [App\Http\Controllers\DefaultPasswordController::class, 'getInfo']);
Route::post('/admin/default-password/set', [App\Http\Controllers\DefaultPasswordController::class, 'setDefaultPassword']);
Route::delete('/admin/default-password/remove', [App\Http\Controllers\DefaultPasswordController::class, 'removeDefaultPassword']);
Route::post('/reset-password-forced', [App\Http\Controllers\DefaultPasswordController::class, 'forcePasswordReset']);
Route::get('/user/password-expiry-status', [App\Http\Controllers\DefaultPasswordController::class, 'getPasswordExpiryStatus']);
Route::get('/admin/users', [UsersController::class, 'index']);
// Notification routes (session-based auth)
Route::get('/notifications', [NotificationController::class, 'index']);
Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount']);
Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
Route::get('/notifications/{id}', [NotificationController::class, 'show']);
Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
Route::delete('/notifications/clear-all', [NotificationController::class, 'clearAll']);
Route::post('/notifications/test', [NotificationController::class, 'sendTestNotification']);

// Auth routes (session-based auth)
Route::get('/auth/me', [AuthController::class, 'me']);
Route::get('/user', [AuthController::class, 'me']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Default password system routes (Admin only)
    Route::get('/default-password/status', [App\Http\Controllers\Api\DefaultPasswordSystemController::class, 'getStatus']);
    Route::get('/default-password/history', [App\Http\Controllers\Api\DefaultPasswordSystemController::class, 'getHistory']);
    Route::post('/default-password/set', [App\Http\Controllers\Api\DefaultPasswordSystemController::class, 'setPassword']);
    Route::post('/default-password/generate', [App\Http\Controllers\Api\DefaultPasswordSystemController::class, 'generatePassword']);
});

// Test Sanctum token creation
Route::get('/test-token', function () {
    try {
        $user = \App\Models\User::where('email', 'admin@maintenance.com')->first();
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }
        
        // Test token creation
        $token = $user->createToken('test-token');
        
        return response()->json([
            'success' => true,
            'message' => 'Token created successfully',
            'token' => substr($token->plainTextToken, 0, 20) . '...',
            'user' => $user->email,
            'user_id' => $user->id_user,
            'token_id' => $token->accessToken->id
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ], 500);
    }
});

// Test login with detailed logging
Route::post('/test-login', function (\Illuminate\Http\Request $request) {
    try {
        $email = $request->input('email', 'admin@maintenance.com');
        $password = $request->input('password', '123456');
        
        $user = \App\Models\User::where('email', $email)->first();
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }
        
        if (!\Illuminate\Support\Facades\Hash::check($password, $user->password)) {
            return response()->json(['error' => 'Invalid password'], 401);
        }
        
        $token = $user->createToken('login-test-token');
        
        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id_user,
                'name' => trim(($user->prenom ?? '') . ' ' . ($user->nom ?? '')),
                'email' => $user->email,
                'role_id' => $user->role_id
            ],
            'token' => $token->plainTextToken,
            'token_preview' => substr($token->plainTextToken, 0, 20) . '...'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Test notification creation
Route::get('/test-notification', function () {
    try {
        // Create a test notification for user ID 4 (Mohamed Mansouri)
        $user = \App\Models\User::find(4);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }
        
        $notification = \App\Models\Notification::create([
            'titre' => 'Test Notification',
            'message' => 'This is a test notification to verify the system is working',
            'type' => 'system',
            'user_id' => $user->id_user,
            'lu' => false,
            'date_creation' => now(),
            'priorite' => 'normale'
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Test notification created',
            'notification_id' => $notification->id_notification,
            'user_id' => $user->id_user,
            'user_email' => $user->email
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Test notification service
Route::get('/test-notification-service', function () {
    try {
        $user = \App\Models\User::find(4); // Mohamed Mansouri
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }
        
        $result = \App\Services\NotificationService::sendTestNotification($user);
        
        return response()->json([
            'success' => true,
            'message' => 'NotificationService test completed',
            'notifications_created' => $result,
            'user_email' => $user->email
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Test authentication in API requests
Route::get('/test-auth', function (\Illuminate\Http\Request $request) {
    try {
        $authUser = auth()->user();
        $sanctumUser = auth('sanctum')->user();
        $requestUser = $request->user();
        
        return response()->json([
            'success' => true,
            'auth_user' => $authUser ? [
                'id' => $authUser->id_user,
                'email' => $authUser->email
            ] : null,
            'sanctum_user' => $sanctumUser ? [
                'id' => $sanctumUser->id_user,
                'email' => $sanctumUser->email
            ] : null,
            'request_user' => $requestUser ? [
                'id' => $requestUser->id_user,
                'email' => $requestUser->email
            ] : null,
            'token_present' => $request->bearerToken() ? 'yes' : 'no'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
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

        // Create the user that matches the login attempts
        \App\Models\User::firstOrCreate(
            ['email' => 'admin@maintenance.com'],
            [
                'nom' => 'Admin',
                'prenom' => 'System',
                'name' => 'System Admin',
                'matricule' => 'SYS001',
                'password' => Hash::make('123456'),
                'numero_telephone' => '0600000001',
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
                ['email' => 'admin@maintenance.com', 'password' => '123456', 'role' => 'Admin'],
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
    Route::post('/equipements', [EquipementController::class, 'store']); // Créer
    Route::get('/equipements/user/{userId}', [EquipementController::class, 'getUserEquipements']);
    Route::get('/equipements/stats', [EquipementController::class, 'getStats']); // Statistiques
    Route::get('/equipements/{id}', [EquipementController::class, 'show']);
    Route::put('/equipements/{id}', [EquipementController::class, 'update']); // Modifier
    Route::delete('/equipements/{id}', [EquipementController::class, 'destroy']); // Supprimer
       // Utilisateurs routes
       Route::get('/utilisateurs', [UsersController::class, 'index']);
       Route::post('/utilisateurs', [UsersController::class, 'store']);
       Route::get('/utilisateurs/{id}', [UsersController::class, 'show']);
       Route::put('/utilisateurs/{id}', [UsersController::class, 'update']);
       Route::delete('/utilisateurs/{id}', [UsersController::class, 'destroy']);
       
    // User password change (with current password) - moved here to match profile update middleware
    Route::post('/change-password', [App\Http\Controllers\PasswordResetController::class, 'changePassword']);

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

    // Removed duplicate history routes - proper ones are defined later in the file

    Route::get('/utilisateurs', [UsersController::class, 'index']);
    Route::post('/utilisateurs', [UsersController::class, 'store']); // Créer un utilisateur
    Route::get('/utilisateurs/{id}', [UsersController::class, 'show']);
    Route::put('/utilisateurs/{id}', [UsersController::class, 'update']); // Modifier un utilisateur
    Route::delete('/utilisateurs/{id}', [UsersController::class, 'destroy']); // Supprimer un utilisateur
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

// Password management routes
Route::post('/password-reset/request', [App\Http\Controllers\PasswordResetController::class, 'requestReset']);

Route::middleware('web')->group(function () {
    // Password reset management (admin only)
    Route::get('/password-reset-requests', [App\Http\Controllers\PasswordResetController::class, 'getRequests']);
    Route::get('/password-resets', [App\Http\Controllers\PasswordResetController::class, 'getRequests']);
    Route::post('/password-reset-requests/{id}/approve', [App\Http\Controllers\PasswordResetController::class, 'approveRequest']);
    Route::post('/password-reset-requests/{id}/reject', [App\Http\Controllers\PasswordResetController::class, 'rejectRequest']);
    Route::post('/password-resets/{id}/approve', [App\Http\Controllers\PasswordResetController::class, 'approveRequest']);
    Route::post('/password-resets/{id}/reject', [App\Http\Controllers\PasswordResetController::class, 'rejectRequest']);
    
    // Legacy password request routes (to be removed)
    Route::post('/password-requests', [App\Http\Controllers\Api\PasswordRequestController::class, 'createRequest']);
    Route::get('/password-requests', [App\Http\Controllers\Api\PasswordRequestController::class, 'getRequests']);
    Route::post('/password-requests/{id}/approve', [App\Http\Controllers\Api\PasswordRequestController::class, 'approveRequest']);
    Route::post('/password-requests/{id}/reject', [App\Http\Controllers\Api\PasswordRequestController::class, 'rejectRequest']);

    // History routes (Admin only)
    Route::get('/history/users', [App\Http\Controllers\Api\HistoryController::class, 'getUsersHistory']);
    Route::get('/history/users/{userId}/tickets', [App\Http\Controllers\Api\HistoryController::class, 'getUserTickets']);
    Route::get('/history/equipments', [App\Http\Controllers\Api\HistoryController::class, 'getEquipmentsHistory']);
    Route::get('/history/equipments/{equipmentId}/issues', [App\Http\Controllers\Api\HistoryController::class, 'getEquipmentIssues']);

    // Excel Export routes (Admin only)
    Route::post('/excel-export/equipment-full', [App\Http\Controllers\ExcelExportController::class, 'exportEquipmentFull']);
    Route::post('/excel-export/equipment-only', [App\Http\Controllers\ExcelExportController::class, 'exportEquipmentOnly']);
    Route::post('/excel-export/users', [App\Http\Controllers\ExcelExportController::class, 'exportUsers']);
    Route::post('/excel-export/tickets', [App\Http\Controllers\ExcelExportController::class, 'exportTickets']);
    Route::post('/excel-export/monthly-report', [App\Http\Controllers\ExcelExportController::class, 'exportMonthlyReport']);

    // CSV Export routes (Admin only) - Temporary fallback
    Route::post('/csv-export/equipment-full', [App\Http\Controllers\CsvExportController::class, 'exportEquipmentFull']);
    Route::post('/csv-export/equipment-only', [App\Http\Controllers\CsvExportController::class, 'exportEquipmentOnly']);
    Route::post('/csv-export/users', [App\Http\Controllers\CsvExportController::class, 'exportUsers']);
    Route::post('/csv-export/tickets', [App\Http\Controllers\CsvExportController::class, 'exportTickets']);
    Route::post('/csv-export/monthly-report', [App\Http\Controllers\CsvExportController::class, 'exportMonthlyReport']);

    // Test routes for debugging
    Route::get('/test-auth', [App\Http\Controllers\TestExportController::class, 'testAuth']);
    Route::post('/test-export', [App\Http\Controllers\TestExportController::class, 'testSimpleExport']);
    
    // Simple working exports
    Route::post('/simple-export/equipment', [App\Http\Controllers\SimpleExportController::class, 'exportEquipmentCsv']);
    Route::post('/simple-export/users', [App\Http\Controllers\SimpleExportController::class, 'exportUsersCsv']);
    
    // Working exports (no auth for testing)
    Route::post('/working-export/equipment', [App\Http\Controllers\WorkingExportController::class, 'exportEquipment']);
    Route::post('/working-export/users', [App\Http\Controllers\WorkingExportController::class, 'exportUsers']);
    Route::post('/working-export/tickets', [App\Http\Controllers\WorkingExportController::class, 'exportTickets']);
    
    // Ultra simple test exports
    Route::post('/ultra-simple/equipment', [App\Http\Controllers\UltraSimpleExportController::class, 'exportEquipment']);
    Route::post('/ultra-simple/users', [App\Http\Controllers\UltraSimpleExportController::class, 'exportUsers']);
    Route::post('/ultra-simple/tickets', [App\Http\Controllers\UltraSimpleExportController::class, 'exportTickets']);
});
