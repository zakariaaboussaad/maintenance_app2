<?php

// Script to populate MySQL maintenance_db with sample data

try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=maintenance_db;charset=utf8mb4', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Connected to MySQL maintenance_db successfully!\n";
    
    // Check current data
    $tables = ['users', 'equipements', 'tickets', 'roles', 'type_equipements'];
    foreach ($tables as $table) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM $table");
            $count = $stmt->fetch()['count'];
            echo "Table $table has $count records\n";
        } catch (Exception $e) {
            echo "Table $table: " . $e->getMessage() . "\n";
        }
    }
    
    // Insert roles if empty
    $stmt = $pdo->query("SELECT COUNT(*) FROM roles");
    if ($stmt->fetch()['count'] == 0) {
        echo "\nInserting roles...\n";
        $pdo->exec("INSERT INTO roles (id, nom) VALUES 
            (1, 'Administrateur'),
            (2, 'Technicien'), 
            (3, 'Utilisateur')");
        echo "Roles inserted!\n";
    }
    
    // Insert type_equipements if empty
    $stmt = $pdo->query("SELECT COUNT(*) FROM type_equipements");
    if ($stmt->fetch()['count'] == 0) {
        echo "\nInserting equipment types...\n";
        $pdo->exec("INSERT INTO type_equipements (id, nom) VALUES 
            (1, 'Ordinateur'),
            (2, 'Imprimante'),
            (3, 'Serveur'),
            (4, 'Réseau'),
            (5, 'Mobile')");
        echo "Equipment types inserted!\n";
    }
    
    // Insert users if empty
    $stmt = $pdo->query("SELECT COUNT(*) FROM users");
    if ($stmt->fetch()['count'] == 0) {
        echo "\nInserting users...\n";
        $pdo->exec("INSERT INTO users (id_user, nom, prenom, matricule, email, password, numero_telephone, poste_affecte, role_id, is_active, date_embauche, created_at, updated_at) VALUES 
            (1, 'Admin', 'System', 'ADM001', 'admin@maintenance.com', '" . password_hash('admin123', PASSWORD_DEFAULT) . "', '0123456789', 'Direction', 1, 1, '2023-01-01', NOW(), NOW()),
            (2, 'Dupont', 'Jean', 'TECH001', 'jean.dupont@maintenance.com', '" . password_hash('tech123', PASSWORD_DEFAULT) . "', '0123456790', 'Service Technique', 2, 1, '2023-02-01', NOW(), NOW()),
            (3, 'Martin', 'Marie', 'USER001', 'marie.martin@maintenance.com', '" . password_hash('user123', PASSWORD_DEFAULT) . "', '0123456791', 'Comptabilité', 3, 1, '2023-03-01', NOW(), NOW()),
            (4, 'Bernard', 'Paul', 'USER002', 'paul.bernard@maintenance.com', '" . password_hash('user123', PASSWORD_DEFAULT) . "', '0123456792', 'Ressources Humaines', 3, 1, '2023-04-01', NOW(), NOW()),
            (5, 'Leroy', 'Sophie', 'TECH002', 'sophie.leroy@maintenance.com', '" . password_hash('tech123', PASSWORD_DEFAULT) . "', '0123456793', 'Service Technique', 2, 1, '2023-05-01', NOW(), NOW())");
        echo "Users inserted!\n";
    }
    
    // Insert equipements if empty
    $stmt = $pdo->query("SELECT COUNT(*) FROM equipements");
    if ($stmt->fetch()['count'] == 0) {
        echo "\nInserting equipment...\n";
        $pdo->exec("INSERT INTO equipements (numero_serie, modele, marque, type_equipement_id, status, date_installation, utilisateur_assigne, created_at, updated_at) VALUES 
            ('DL001', 'Latitude 5520', 'Dell', 1, 'Actif', '2023-01-15', 2, NOW(), NOW()),
            ('HP001', 'LaserJet Pro 400', 'HP', 2, 'Actif', '2023-01-20', NULL, NOW(), NOW()),
            ('LN001', 'ThinkPad T14', 'Lenovo', 1, 'En maintenance', '2023-02-01', 3, NOW(), NOW()),
            ('AP001', 'MacBook Pro 13', 'Apple', 1, 'Actif', '2023-02-15', 4, NOW(), NOW()),
            ('CS001', 'Catalyst 2960', 'Cisco', 4, 'Actif', '2023-03-01', NULL, NOW(), NOW()),
            ('DL002', 'OptiPlex 7090', 'Dell', 1, 'Actif', '2023-03-15', 5, NOW(), NOW()),
            ('HP002', 'OfficeJet Pro 9015', 'HP', 2, 'Hors service', '2023-04-01', NULL, NOW(), NOW()),
            ('SV001', 'PowerEdge R740', 'Dell', 3, 'Actif', '2023-04-15', NULL, NOW(), NOW()),
            ('LN002', 'IdeaPad 3', 'Lenovo', 1, 'Actif', '2023-05-01', 1, NOW(), NOW()),
            ('MS001', 'Surface Pro 8', 'Microsoft', 1, 'Actif', '2023-05-15', NULL, NOW(), NOW())");
        echo "Equipment inserted!\n";
    }
    
    // Insert tickets if empty
    $stmt = $pdo->query("SELECT COUNT(*) FROM tickets");
    if ($stmt->fetch()['count'] == 0) {
        echo "\nInserting tickets...\n";
        $pdo->exec("INSERT INTO tickets (id, titre, description, status, priorite, user_id, technicien_assigne, equipement_id, created_at, updated_at) VALUES 
            (1, 'Imprimante ne fonctionne plus', 'L\\'imprimante HP LaserJet ne répond plus depuis ce matin', 'Ouvert', 'Haute', 3, 2, 'HP001', '2024-01-15 09:00:00', '2024-01-15 09:00:00'),
            (2, 'Ordinateur très lent', 'Le ThinkPad met plus de 10 minutes à démarrer', 'En cours', 'Moyenne', 3, 2, 'LN001', '2024-01-14 14:30:00', '2024-01-15 08:00:00'),
            (3, 'Problème de connexion réseau', 'Impossible de se connecter au serveur depuis le MacBook', 'Fermé', 'Moyenne', 4, 5, 'AP001', '2024-01-13 11:15:00', '2024-01-14 16:30:00'),
            (4, 'Écran noir au démarrage', 'L\\'ordinateur Dell s\\'allume mais l\\'écran reste noir', 'Ouvert', 'Haute', 5, NULL, 'DL002', '2024-01-16 08:45:00', '2024-01-16 08:45:00'),
            (5, 'Mise à jour système requise', 'Le système d\\'exploitation doit être mis à jour', 'En cours', 'Basse', 1, 2, 'LN002', '2024-01-12 16:00:00', '2024-01-15 10:00:00'),
            (6, 'Problème d\\'impression couleur', 'L\\'imprimante OfficeJet n\\'imprime plus en couleur', 'Fermé', 'Basse', 2, 5, 'HP002', '2024-01-11 13:20:00', '2024-01-13 17:00:00'),
            (7, 'Serveur inaccessible', 'Le serveur PowerEdge ne répond plus aux requêtes', 'Ouvert', 'Critique', 1, 2, 'SV001', '2024-01-16 07:30:00', '2024-01-16 07:30:00'),
            (8, 'Clavier défaillant', 'Plusieurs touches du clavier ne fonctionnent plus', 'En cours', 'Moyenne', 4, 5, 'MS001', '2024-01-15 15:45:00', '2024-01-16 09:15:00')");
        echo "Tickets inserted!\n";
    }
    
    echo "\n=== DATABASE POPULATION COMPLETE ===\n";
    echo "Your MySQL maintenance_db now has sample data for testing exports!\n";
    
} catch (PDOException $e) {
    echo "Database connection failed: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

?>
