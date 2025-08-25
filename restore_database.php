<?php
try {
    $pdo = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create tables
    $pdo->exec("CREATE TABLE IF NOT EXISTS roles (
        id_role INTEGER PRIMARY KEY AUTOINCREMENT,
        nom_role VARCHAR(50) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id_user INTEGER PRIMARY KEY AUTOINCREMENT,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        matricule VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        email_verified_at DATETIME NULL,
        password VARCHAR(255) NOT NULL,
        numero_telephone VARCHAR(20) NULL,
        poste_affecte VARCHAR(100) NOT NULL,
        role_id INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        date_embauche DATE NULL,
        remember_token VARCHAR(100) NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id_role)
    )");
    
    $pdo->exec("CREATE TABLE IF NOT EXISTS type_equipements (
        id_type INTEGER PRIMARY KEY AUTOINCREMENT,
        nom_type VARCHAR(100) NOT NULL,
        description TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    
    $pdo->exec("CREATE TABLE IF NOT EXISTS equipements (
        numero_serie VARCHAR(100) PRIMARY KEY,
        modele VARCHAR(100) NOT NULL,
        marque VARCHAR(100) NULL,
        os VARCHAR(100) NULL,
        date_installation DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'Actif',
        localisation VARCHAR(255) NULL,
        prix_achat DECIMAL(10,2) NULL,
        date_garantie DATE NULL,
        type_equipement_id INTEGER NOT NULL,
        utilisateur_assigne INTEGER NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (type_equipement_id) REFERENCES type_equipements(id_type),
        FOREIGN KEY (utilisateur_assigne) REFERENCES users(id_user)
    )");
    
    $pdo->exec("CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titre VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'Ouvert',
        priorite VARCHAR(50) DEFAULT 'Moyenne',
        user_id INTEGER NOT NULL,
        technicien_assigne INTEGER NULL,
        equipement_id VARCHAR(100) NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id_user),
        FOREIGN KEY (technicien_assigne) REFERENCES users(id_user),
        FOREIGN KEY (equipement_id) REFERENCES equipements(numero_serie)
    )");
    
    $pdo->exec("CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id_user)
    )");
    
    // Insert sample data
    $pdo->exec("INSERT OR IGNORE INTO roles (id_role, nom_role) VALUES 
        (1, 'Administrateur'),
        (2, 'Technicien'),
        (3, 'Utilisateur')");
    
    $pdo->exec("INSERT OR IGNORE INTO users (id_user, nom, prenom, matricule, email, password, numero_telephone, poste_affecte, role_id) VALUES 
        (1, 'Admin', 'System', 'ADM001', 'admin@maintenance.com', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '123456789', 'Administrateur Système', 1),
        (2, 'Dupont', 'Jean', 'TECH001', 'jean@maintenance.com', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '987654321', 'Technicien IT', 2),
        (3, 'Martin', 'Marie', 'USER001', 'marie@maintenance.com', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '555666777', 'Employée', 3),
        (4, 'Bernard', 'Paul', 'USER002', 'paul@maintenance.com', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '111222333', 'Employé', 3),
        (5, 'Leroy', 'Sophie', 'TECH002', 'sophie@maintenance.com', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '444555666', 'Technicienne IT', 2)");
    
    $pdo->exec("INSERT OR IGNORE INTO type_equipements (id_type, nom_type, description) VALUES 
        (1, 'Ordinateur', 'Ordinateurs de bureau et portables'),
        (2, 'Périphérique', 'Imprimantes, scanners, etc.'),
        (3, 'Réseau', 'Équipements réseau')");
    
    $pdo->exec("INSERT OR IGNORE INTO equipements (numero_serie, modele, marque, os, date_installation, status, localisation, prix_achat, type_equipement_id, utilisateur_assigne) VALUES 
        ('DL001', 'Latitude 5520', 'Dell', 'Windows 11', '2024-01-15', 'Actif', 'Bureau 101', 899.99, 1, 3),
        ('HP001', 'LaserJet Pro', 'HP', NULL, '2024-02-01', 'En maintenance', 'Salle impression', 299.99, 2, NULL),
        ('LN001', 'ThinkPad T14', 'Lenovo', 'Windows 11', '2024-01-20', 'Actif', 'Bureau 102', 1199.99, 1, 4),
        ('AP001', 'MacBook Pro', 'Apple', 'macOS', '2024-03-01', 'Actif', 'Bureau 103', 1999.99, 1, 5),
        ('SW001', 'Catalyst 2960', 'Cisco', NULL, '2024-01-10', 'Actif', 'Salle serveur', 599.99, 3, NULL),
        ('DL002', 'OptiPlex 7090', 'Dell', 'Windows 11', '2024-02-15', 'Actif', 'Bureau 104', 749.99, 1, 3),
        ('HP002', 'OfficeJet Pro', 'HP', NULL, '2024-03-10', 'Actif', 'Bureau 105', 199.99, 2, NULL),
        ('LN002', 'IdeaPad 5', 'Lenovo', 'Windows 11', '2024-03-15', 'En maintenance', 'Bureau 106', 699.99, 1, 4),
        ('MS001', 'Surface Pro', 'Microsoft', 'Windows 11', '2024-04-01', 'Actif', 'Bureau 107', 1299.99, 1, 5),
        ('CN001', 'EOS R5', 'Canon', NULL, '2024-04-10', 'Actif', 'Studio photo', 3999.99, 2, NULL)");
    
    $pdo->exec("INSERT OR IGNORE INTO tickets (id, titre, description, status, priorite, user_id, technicien_assigne, equipement_id) VALUES 
        (1, 'Problème imprimante HP001', 'L''imprimante HP001 ne fonctionne plus, voyant rouge allumé', 'Ouvert', 'Haute', 3, 2, 'HP001'),
        (2, 'Ordinateur lent DL001', 'L''ordinateur DL001 est très lent au démarrage', 'En cours', 'Moyenne', 3, 2, 'DL001'),
        (3, 'Écran noir LN002', 'L''écran du portable LN002 reste noir au démarrage', 'En cours', 'Haute', 4, 5, 'LN002'),
        (4, 'Connexion réseau', 'Problème de connexion internet sur le poste DL002', 'Ouvert', 'Moyenne', 3, NULL, 'DL002'),
        (5, 'Mise à jour logiciel', 'Demande de mise à jour des logiciels sur AP001', 'Fermé', 'Basse', 5, 2, 'AP001'),
        (6, 'Installation Office', 'Installation de Microsoft Office sur LN001', 'Fermé', 'Moyenne', 4, 5, 'LN001'),
        (7, 'Problème audio', 'Pas de son sur l''ordinateur MS001', 'Ouvert', 'Basse', 5, NULL, 'MS001'),
        (8, 'Sauvegarde données', 'Mise en place sauvegarde automatique', 'En cours', 'Moyenne', 3, 2, NULL),
        (9, 'Formation utilisateur', 'Formation sur les nouveaux logiciels', 'Ouvert', 'Basse', 4, 5, NULL),
        (10, 'Maintenance préventive', 'Maintenance préventive des équipements', 'Planifié', 'Moyenne', 2, 2, NULL),
        (11, 'Problème clavier', 'Certaines touches du clavier ne fonctionnent plus', 'Ouvert', 'Moyenne', 3, NULL, 'DL001'),
        (12, 'Virus détecté', 'Antivirus a détecté une menace sur LN001', 'En cours', 'Haute', 4, 2, 'LN001'),
        (13, 'Demande nouveau logiciel', 'Installation d''un logiciel de design graphique', 'Ouvert', 'Basse', 5, NULL, 'AP001'),
        (14, 'Problème réseau WiFi', 'Connexion WiFi instable dans le bureau 105', 'En cours', 'Moyenne', 3, 5, NULL),
        (15, 'Mise à jour système', 'Mise à jour du système d''exploitation', 'Fermé', 'Moyenne', 4, 2, 'LN002'),
        (16, 'Configuration email', 'Configuration de la messagerie professionnelle', 'Ouvert', 'Basse', 5, NULL, 'MS001'),
        (17, 'Problème imprimante réseau', 'Impossible d''imprimer depuis le réseau', 'Ouvert', 'Moyenne', 3, 5, 'HP002')");
    
    echo "Database restored successfully!\n";
    echo "Tables created: roles, users, type_equipements, equipements, tickets, notifications\n";
    echo "Sample data inserted: 5 users, 10 equipments, 17 tickets\n";
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
