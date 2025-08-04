<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Rôles
        $roles = [
            [
                'id_role' => 1,
                'nom' => 'admin',
                'description' => 'Administrateur système avec tous les droits',
                'permissions' => json_encode(['create', 'read', 'update', 'delete', 'manage_users', 'reports']),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id_role' => 2,
                'nom' => 'technicien',
                'description' => 'Technicien de maintenance',
                'permissions' => json_encode(['create', 'read', 'update', 'interventions', 'equipment']),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id_role' => 3,
                'nom' => 'utilisateur',
                'description' => 'Utilisateur standard - peut créer des tickets',
                'permissions' => json_encode(['read', 'create_ticket', 'view_own_tickets']),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        DB::table('roles')->insert($roles);

        // 2. Utilisateurs
        $users = [
            [
                'id_user' => 1,
                'nom' => 'Admin',
                'prenom' => 'System',
                'matricule' => 'ADM001',
                'email' => 'admin@maintenance.com',
                'password' => Hash::make('password123'),
                'numero_telephone' => '+212600000001',
                'poste_affecte' => 'Direction IT',
                'role_id' => 1,
                'is_active' => true,
                'date_embauche' => '2023-01-01',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id_user' => 2,
                'nom' => 'Benali',
                'prenom' => 'Ahmed',
                'matricule' => 'TECH001',
                'email' => 'ahmed.benali@maintenance.com',
                'password' => Hash::make('password123'),
                'numero_telephone' => '+212600000002',
                'poste_affecte' => 'Service Technique',
                'role_id' => 2,
                'is_active' => true,
                'date_embauche' => '2023-02-15',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id_user' => 3,
                'nom' => 'Alami',
                'prenom' => 'Fatima',
                'matricule' => 'TECH002',
                'email' => 'fatima.alami@maintenance.com',
                'password' => Hash::make('password123'),
                'numero_telephone' => '+212600000003',
                'poste_affecte' => 'Service Technique',
                'role_id' => 2,
                'is_active' => true,
                'date_embauche' => '2023-03-10',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id_user' => 4,
                'nom' => 'Mansouri',
                'prenom' => 'Mohamed',
                'matricule' => 'USER001',
                'email' => 'mohamed.mansouri@maintenance.com',
                'password' => Hash::make('password123'),
                'numero_telephone' => '+212600000004',
                'poste_affecte' => 'Comptabilité',
                'role_id' => 3,
                'is_active' => true,
                'date_embauche' => '2023-04-05',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id_user' => 5,
                'nom' => 'Idrissi',
                'prenom' => 'Aicha',
                'matricule' => 'USER002',
                'email' => 'aicha.idrissi@maintenance.com',
                'password' => Hash::make('password123'),
                'numero_telephone' => '+212600000005',
                'poste_affecte' => 'Ressources Humaines',
                'role_id' => 3,
                'is_active' => true,
                'date_embauche' => '2023-05-20',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        DB::table('users')->insert($users);

        // 3. Types d'équipements
        $typeEquipements = [
    [
        'id_type' => 1, // or remove this line for auto-increment
        'nom_type' => 'Ordinateur',
        'description' => 'Ordinateurs de bureau et portables',
        'is_active' => true, // optional since it defaults to true
    ],
    [
        'id_type' => 2,
        'nom_type' => 'Imprimante',
        'description' => 'Imprimantes laser et jet d\'encre',
        'is_active' => true,
    ],
    [
        'id_type' => 3,
        'nom_type' => 'Réseau',
        'description' => 'Équipements réseau (routeurs, switches)',
        'is_active' => true,
    ],
    [
        'id_type' => 4,
        'nom_type' => 'Téléphone',
        'description' => 'Téléphones fixes et systèmes de communication',
        'is_active' => true,
    ],
    [
        'id_type' => 5,
        'nom_type' => 'Serveur',
        'description' => 'Serveurs et équipements datacenter',
        'is_active' => true,
    ],
];

        DB::table('type_equipements')->insert($typeEquipements);

        // 4. Équipements
        $equipements = [
    [
        'numero_serie' => 'DL123456789',
        'modele' => 'OptiPlex 3080',
        'marque' => 'Dell',
        'os' => 'Windows 11',
        'date_installation' => '2023-01-15',
        'status' => 'Actif',
        'localisation' => 'Bureau Comptabilité',
        'prix_achat' => 899.99,
        'date_garantie' => '2026-01-15',
        'type_equipement_id' => 1,
        'utilisateur_assigne' => 4,
    ],
    [
        'numero_serie' => 'HP987654321',
        'modele' => 'EliteDesk 800',
        'marque' => 'HP',
        'os' => 'Windows 11',
        'date_installation' => '2023-02-01',
        'status' => 'Actif',
        'localisation' => 'Bureau RH',
        'prix_achat' => 1299.99,
        'date_garantie' => '2026-02-01',
        'type_equipement_id' => 1,
        'utilisateur_assigne' => 5,
    ],
    [
        'numero_serie' => 'CN555444333',
        'modele' => 'ImageRUNNER 2520',
        'marque' => 'Canon',
        'os' => null,
        'date_installation' => '2023-01-20',
        'status' => 'Actif',
        'localisation' => 'Hall Principal',
        'prix_achat' => 2500.00,
        'date_garantie' => '2025-01-20',
        'type_equipement_id' => 2,
        'utilisateur_assigne' => null,
    ],
    [
        'numero_serie' => 'CS111222333',
        'modele' => 'Catalyst 2960',
        'marque' => 'Cisco',
        'os' => 'IOS',
        'date_installation' => '2023-01-10',
        'status' => 'Actif',
        'localisation' => 'Salle Serveur',
        'prix_achat' => 1500.00,
        'date_garantie' => '2028-01-10',
        'type_equipement_id' => 3,
        'utilisateur_assigne' => null,
    ],
    [
        'numero_serie' => 'DL999888777',
        'modele' => 'PowerEdge R740',
        'marque' => 'Dell',
        'os' => 'Ubuntu Server 22.04',
        'date_installation' => '2023-01-05',
        'status' => 'Actif',
        'localisation' => 'Salle Serveur',
        'prix_achat' => 5000.00,
        'date_garantie' => '2028-01-05',
        'type_equipement_id' => 5,
        'utilisateur_assigne' => null,
    ],
];

        DB::table('equipements')->insert($equipements);

        // 5. Catégories de pannes
        $categories = [
            [
                'id' => 1,
                'nom' => 'Hardware',
                'description' => 'Problèmes matériels',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 2,
                'nom' => 'Software',
                'description' => 'Problèmes logiciels',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 3,
                'nom' => 'Réseau',
                'description' => 'Problèmes de connectivité réseau',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 4,
                'nom' => 'Impression',
                'description' => 'Problèmes d\'impression',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        DB::table('categories')->insert($categories);

        // 6. Status des pannes
        $statusPannes = [
            [
                'id' => 1,
                'nom' => 'Ouverte',
                'description' => 'Panne signalée, en attente de traitement',
                'couleur' => '#ff6b6b',
                'is_final' => false,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 2,
                'nom' => 'En cours',
                'description' => 'Panne en cours de traitement',
                'couleur' => '#ffa726',
                'is_final' => false,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 3,
                'nom' => 'Résolue',
                'description' => 'Panne résolue avec succès',
                'couleur' => '#66bb6a',
                'is_final' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 4,
                'nom' => 'Fermée',
                'description' => 'Panne fermée définitivement',
                'couleur' => '#78909c',
                'is_final' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        DB::table('status_pannes')->insert($statusPannes);

        // 7. Pannes d'exemple
        $pannes = [
    [
        'titre' => 'Écran bleu au démarrage',
        'description' => 'L\'ordinateur affiche un écran bleu au démarrage avec le message "SYSTEM_THREAD_EXCEPTION_NOT_HANDLED"',
        'date_panne' => '2025-08-01 09:30:00',
        'date_detection' => '2025-08-01 09:30:00',
        'severite' => 'majeure', // was 'Haute'
        'type_panne' => 'hardware',
        'equipement_id' => 'DL123456789', // numero_serie from equipements
        'status_panne_id' => 3, // Resolved status
        'detecte_par' => 4, // user id_user
        'cause_probable' => 'Problème de pilote ou défaillance matérielle',
        'solution_temporaire' => 'Redémarrage en mode sans échec',
        'panne_recurrente' => false,
    ],
    [
        'titre' => 'Bourrage papier récurrent',
        'description' => 'L\'imprimante se bloque régulièrement avec un bourrage papier, même après nettoyage',
        'date_panne' => '2025-08-02 11:20:00',
        'date_detection' => '2025-08-02 11:20:00',
        'severite' => 'moyenne',
        'type_panne' => 'hardware',
        'equipement_id' => 'CN555444333', // numero_serie from equipements
        'status_panne_id' => 2, // In progress status
        'detecte_par' => 5, // user id_user
        'cause_probable' => 'Usure des rouleaux d\'entraînement',
        'solution_temporaire' => 'Nettoyage manuel régulier',
        'panne_recurrente' => true,
    ],
    [
        'titre' => 'Perte de connectivité intermittente',
        'description' => 'Le switch perd la connexion de manière intermittente, affectant plusieurs postes',
        'date_panne' => '2025-08-04 16:45:00',
        'date_detection' => '2025-08-04 16:45:00',
        'severite' => 'critique',
        'type_panne' => 'reseau',
        'equipement_id' => 'CS111222333', // numero_serie from equipements
        'status_panne_id' => 1, // New status
        'detecte_par' => 2, // user id_user
        'cause_probable' => 'Surchauffe ou défaillance port',
        'solution_temporaire' => 'Redémarrage du switch',
        'panne_recurrente' => false,
    ],
];

        DB::table('pannes')->insert($pannes);

        echo "✅ Base de données remplie avec succès !\n\n";
        echo "👤 Comptes utilisateurs créés :\n";
        echo "   🔐 Admin: admin@maintenance.com / password123\n";
        echo "   🔧 Technicien: ahmed.benali@maintenance.com / password123\n";
        echo "   🔧 Technicien: fatima.alami@maintenance.com / password123\n";
        echo "   👤 Utilisateur: mohamed.mansouri@maintenance.com / password123\n";
        echo "   👤 Utilisateur: aicha.idrissi@maintenance.com / password123\n\n";
        echo "📊 Données créées :\n";
        echo "   • 3 rôles (admin, technicien, utilisateur)\n";
        echo "   • 5 utilisateurs\n";
        echo "   • 5 types d'équipements\n";
        echo "   • 5 équipements\n";
        echo "   • 4 catégories de pannes\n";
        echo "   • 4 status de pannes\n";
        echo "   • 3 pannes d'exemple\n";
    }
}
