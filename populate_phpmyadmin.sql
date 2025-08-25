-- SQL script to populate maintenance_db with sample data
-- Run this in phpMyAdmin SQL tab

-- Insert roles
INSERT INTO roles (nom) VALUES 
('Administrateur'),
('Technicien'), 
('Utilisateur');

-- Insert equipment types
INSERT INTO type_equipements (nom) VALUES 
('Ordinateur'),
('Imprimante'),
('Serveur'),
('Réseau'),
('Mobile');

-- Insert users
INSERT INTO users (nom, prenom, matricule, email, password, numero_telephone, poste_affecte, role_id, is_active, date_embauche, created_at, updated_at) VALUES 
('Admin', 'System', 'ADM001', 'admin@maintenance.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0123456789', 'Direction', 1, 1, '2023-01-01', NOW(), NOW()),
('Dupont', 'Jean', 'TECH001', 'jean.dupont@maintenance.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0123456790', 'Service Technique', 2, 1, '2023-02-01', NOW(), NOW()),
('Martin', 'Marie', 'USER001', 'marie.martin@maintenance.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0123456791', 'Comptabilité', 3, 1, '2023-03-01', NOW(), NOW()),
('Bernard', 'Paul', 'USER002', 'paul.bernard@maintenance.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0123456792', 'Ressources Humaines', 3, 1, '2023-04-01', NOW(), NOW()),
('Leroy', 'Sophie', 'TECH002', 'sophie.leroy@maintenance.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0123456793', 'Service Technique', 2, 1, '2023-05-01', NOW(), NOW());

-- Insert equipment
INSERT INTO equipements (numero_serie, modele, marque, type_equipement_id, status, date_installation, utilisateur_assigne, created_at, updated_at) VALUES 
('DL001', 'Latitude 5520', 'Dell', 1, 'Actif', '2023-01-15', 2, NOW(), NOW()),
('HP001', 'LaserJet Pro 400', 'HP', 2, 'Actif', '2023-01-20', NULL, NOW(), NOW()),
('LN001', 'ThinkPad T14', 'Lenovo', 1, 'En maintenance', '2023-02-01', 3, NOW(), NOW()),
('AP001', 'MacBook Pro 13', 'Apple', 1, 'Actif', '2023-02-15', 4, NOW(), NOW()),
('CS001', 'Catalyst 2960', 'Cisco', 4, 'Actif', '2023-03-01', NULL, NOW(), NOW()),
('DL002', 'OptiPlex 7090', 'Dell', 1, 'Actif', '2023-03-15', 5, NOW(), NOW()),
('HP002', 'OfficeJet Pro 9015', 'HP', 2, 'Hors service', '2023-04-01', NULL, NOW(), NOW()),
('SV001', 'PowerEdge R740', 'Dell', 3, 'Actif', '2023-04-15', NULL, NOW(), NOW());

-- Insert tickets
INSERT INTO tickets (titre, description, status, priorite, user_id, technicien_assigne, equipement_id, created_at, updated_at) VALUES 
('Imprimante ne fonctionne plus', 'L\'imprimante HP LaserJet ne répond plus depuis ce matin', 'Ouvert', 'Haute', 3, 2, 'HP001', '2024-01-15 09:00:00', '2024-01-15 09:00:00'),
('Ordinateur très lent', 'Le ThinkPad met plus de 10 minutes à démarrer', 'En cours', 'Moyenne', 3, 2, 'LN001', '2024-01-14 14:30:00', '2024-01-15 08:00:00'),
('Problème de connexion réseau', 'Impossible de se connecter au serveur depuis le MacBook', 'Fermé', 'Moyenne', 4, 5, 'AP001', '2024-01-13 11:15:00', '2024-01-14 16:30:00'),
('Écran noir au démarrage', 'L\'ordinateur Dell s\'allume mais l\'écran reste noir', 'Ouvert', 'Haute', 5, NULL, 'DL002', '2024-01-16 08:45:00', '2024-01-16 08:45:00'),
('Mise à jour système requise', 'Le système d\'exploitation doit être mis à jour', 'En cours', 'Basse', 1, 2, 'DL001', '2024-01-12 16:00:00', '2024-01-15 10:00:00'),
('Serveur inaccessible', 'Le serveur PowerEdge ne répond plus aux requêtes', 'Ouvert', 'Critique', 1, 2, 'SV001', '2024-01-16 07:30:00', '2024-01-16 07:30:00');

-- Check final counts
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'equipements', COUNT(*) FROM equipements  
UNION ALL
SELECT 'tickets', COUNT(*) FROM tickets
UNION ALL
SELECT 'roles', COUNT(*) FROM roles
UNION ALL
SELECT 'type_equipements', COUNT(*) FROM type_equipements;
