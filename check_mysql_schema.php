<?php

// Check MySQL database schema and populate with correct structure

try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=maintenance_db;charset=utf8mb4', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== CHECKING MYSQL SCHEMA ===\n";
    
    // Check table structures
    $tables = ['users', 'equipements', 'tickets', 'roles', 'type_equipements'];
    
    foreach ($tables as $table) {
        echo "\n--- Table: $table ---\n";
        try {
            $stmt = $pdo->query("DESCRIBE $table");
            $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($columns as $column) {
                echo "- {$column['Field']}: {$column['Type']}\n";
            }
        } catch (Exception $e) {
            echo "Error: " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n=== POPULATING WITH CORRECT SCHEMA ===\n";
    
    // Check and populate roles table
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM roles");
    $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    if ($count == 0) {
        echo "Inserting roles...\n";
        // Get actual column structure for roles
        $stmt = $pdo->query("DESCRIBE roles");
        $roleColumns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $hasId = false;
        foreach ($roleColumns as $col) {
            if ($col['Field'] == 'id') $hasId = true;
        }
        
        if ($hasId) {
            $pdo->exec("INSERT INTO roles (id, nom) VALUES 
                (1, 'Administrateur'),
                (2, 'Technicien'), 
                (3, 'Utilisateur')");
        } else {
            $pdo->exec("INSERT INTO roles (nom) VALUES 
                ('Administrateur'),
                ('Technicien'), 
                ('Utilisateur')");
        }
        echo "✅ Roles inserted!\n";
    }
    
    // Check and populate type_equipements
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM type_equipements");
    $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    if ($count == 0) {
        echo "Inserting equipment types...\n";
        $stmt = $pdo->query("DESCRIBE type_equipements");
        $typeColumns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $hasId = false;
        foreach ($typeColumns as $col) {
            if ($col['Field'] == 'id') $hasId = true;
        }
        
        if ($hasId) {
            $pdo->exec("INSERT INTO type_equipements (id, nom) VALUES 
                (1, 'Ordinateur'),
                (2, 'Imprimante'),
                (3, 'Serveur'),
                (4, 'Réseau'),
                (5, 'Mobile')");
        } else {
            $pdo->exec("INSERT INTO type_equipements (nom) VALUES 
                ('Ordinateur'),
                ('Imprimante'),
                ('Serveur'),
                ('Réseau'),
                ('Mobile')");
        }
        echo "✅ Equipment types inserted!\n";
    }
    
    // Populate users with actual schema
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    if ($count == 0) {
        echo "Inserting users...\n";
        $pdo->exec("INSERT INTO users (nom, prenom, matricule, email, password, numero_telephone, poste_affecte, role_id, is_active, date_embauche, created_at, updated_at) VALUES 
            ('Admin', 'System', 'ADM001', 'admin@maintenance.com', '" . password_hash('admin123', PASSWORD_DEFAULT) . "', '0123456789', 'Direction', 1, 1, '2023-01-01', NOW(), NOW()),
            ('Dupont', 'Jean', 'TECH001', 'jean.dupont@maintenance.com', '" . password_hash('tech123', PASSWORD_DEFAULT) . "', '0123456790', 'Service Technique', 2, 1, '2023-02-01', NOW(), NOW()),
            ('Martin', 'Marie', 'USER001', 'marie.martin@maintenance.com', '" . password_hash('user123', PASSWORD_DEFAULT) . "', '0123456791', 'Comptabilité', 3, 1, '2023-03-01', NOW(), NOW()),
            ('Bernard', 'Paul', 'USER002', 'paul.bernard@maintenance.com', '" . password_hash('user123', PASSWORD_DEFAULT) . "', '0123456792', 'Ressources Humaines', 3, 1, '2023-04-01', NOW(), NOW()),
            ('Leroy', 'Sophie', 'TECH002', 'sophie.leroy@maintenance.com', '" . password_hash('tech123', PASSWORD_DEFAULT) . "', '0123456793', 'Service Technique', 2, 1, '2023-05-01', NOW(), NOW())");
        echo "✅ Users inserted!\n";
    }
    
    // Populate equipements
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM equipements");
    $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    if ($count == 0) {
        echo "Inserting equipment...\n";
        $pdo->exec("INSERT INTO equipements (numero_serie, modele, marque, type_equipement_id, status, date_installation, utilisateur_assigne, created_at, updated_at) VALUES 
            ('DL001', 'Latitude 5520', 'Dell', 1, 'Actif', '2023-01-15', 2, NOW(), NOW()),
            ('HP001', 'LaserJet Pro 400', 'HP', 2, 'Actif', '2023-01-20', NULL, NOW(), NOW()),
            ('LN001', 'ThinkPad T14', 'Lenovo', 1, 'En maintenance', '2023-02-01', 3, NOW(), NOW()),
            ('AP001', 'MacBook Pro 13', 'Apple', 1, 'Actif', '2023-02-15', 4, NOW(), NOW()),
            ('CS001', 'Catalyst 2960', 'Cisco', 4, 'Actif', '2023-03-01', NULL, NOW(), NOW())");
        echo "✅ Equipment inserted!\n";
    }
    
    // Populate tickets
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM tickets");
    $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    if ($count == 0) {
        echo "Inserting tickets...\n";
        $pdo->exec("INSERT INTO tickets (titre, description, status, priorite, user_id, technicien_assigne, equipement_id, created_at, updated_at) VALUES 
            ('Imprimante ne fonctionne plus', 'L\\'imprimante HP LaserJet ne répond plus depuis ce matin', 'Ouvert', 'Haute', 3, 2, 'HP001', '2024-01-15 09:00:00', '2024-01-15 09:00:00'),
            ('Ordinateur très lent', 'Le ThinkPad met plus de 10 minutes à démarrer', 'En cours', 'Moyenne', 3, 2, 'LN001', '2024-01-14 14:30:00', '2024-01-15 08:00:00'),
            ('Problème de connexion réseau', 'Impossible de se connecter au serveur depuis le MacBook', 'Fermé', 'Moyenne', 4, 5, 'AP001', '2024-01-13 11:15:00', '2024-01-14 16:30:00'),
            ('Écran noir au démarrage', 'L\\'ordinateur Dell s\\'allume mais l\\'écran reste noir', 'Ouvert', 'Haute', 5, NULL, 'DL001', '2024-01-16 08:45:00', '2024-01-16 08:45:00')");
        echo "✅ Tickets inserted!\n";
    }
    
    echo "\n=== FINAL COUNT CHECK ===\n";
    foreach ($tables as $table) {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM $table");
        $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        echo "$table: $count records\n";
    }
    
} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage() . "\n";
}

?>
