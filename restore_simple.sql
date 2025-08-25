-- Simple restore script that works with foreign key constraints
-- Run this in phpMyAdmin SQL tab

-- First, clear data in correct order
DELETE FROM pannes WHERE id > 0;
DELETE FROM equipements WHERE numero_serie IS NOT NULL;
DELETE FROM users WHERE id_user > 0;
DELETE FROM type_equipements WHERE id_type > 0;
DELETE FROM categories WHERE id > 0;
DELETE FROM status_pannes WHERE id > 0;
DELETE FROM roles WHERE id_role > 0;

-- Reset auto increment
ALTER TABLE roles AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE type_equipements AUTO_INCREMENT = 1;
ALTER TABLE categories AUTO_INCREMENT = 1;
ALTER TABLE status_pannes AUTO_INCREMENT = 1;
ALTER TABLE pannes AUTO_INCREMENT = 1;

-- Insert your original roles
INSERT INTO roles (nom, description, permissions, is_active, created_at, updated_at) VALUES 
('admin', 'Administrateur système avec tous les droits', '["create","read","update","delete","manage_users","reports"]', 1, NOW(), NOW()),
('technicien', 'Technicien de maintenance', '["create","read","update","interventions","equipment"]', 1, NOW(), NOW()),
('utilisateur', 'Utilisateur standard - peut créer des tickets', '["read","create_ticket","view_own_tickets"]', 1, NOW(), NOW());

-- Insert your original users (the ones you had)
INSERT INTO users (nom, prenom, matricule, email, password, numero_telephone, poste_affecte, role_id, is_active, date_embauche, created_at, updated_at) VALUES 
('Admin', 'System', 'ADM001', 'admin@maintenance.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+212600000001', 'Direction IT', 1, 1, '2023-01-01', NOW(), NOW()),
('Benali', 'Ahmed', 'TECH001', 'ahmed.benali@maintenance.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+212600000002', 'Service Technique', 2, 1, '2023-02-15', NOW(), NOW()),
('Alami', 'Fatima', 'TECH002', 'fatima.alami@maintenance.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+212600000003', 'Service Technique', 2, 1, '2023-03-10', NOW(), NOW()),
('Mansouri', 'Mohamed', 'USER001', 'mohamed.mansouri@maintenance.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+212600000004', 'Comptabilité', 3, 1, '2023-04-05', NOW(), NOW()),
('Idrissi', 'Aicha', 'USER002', 'aicha.idrissi@maintenance.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+212600000005', 'Ressources Humaines', 3, 1, '2023-05-20', NOW(), NOW());

-- Insert your original equipment types
INSERT INTO type_equipements (nom_type, description, is_active) VALUES 
('Ordinateur', 'Ordinateurs de bureau et portables', 1),
('Imprimante', 'Imprimantes laser et jet d\'encre', 1),
('Réseau', 'Équipements réseau (routeurs, switches)', 1),
('Téléphone', 'Téléphones fixes et systèmes de communication', 1),
('Serveur', 'Serveurs et équipements datacenter', 1);

-- Insert your original equipment
INSERT INTO equipements (numero_serie, modele, marque, os, date_installation, status, localisation, prix_achat, date_garantie, type_equipement_id, utilisateur_assigne, created_at, updated_at) VALUES 
('DL123456789', 'OptiPlex 3080', 'Dell', 'Windows 11', '2023-01-15', 'Actif', 'Bureau Comptabilité', 899.99, '2026-01-15', 1, 4, NOW(), NOW()),
('HP987654321', 'EliteDesk 800', 'HP', 'Windows 11', '2023-02-01', 'Actif', 'Bureau RH', 1299.99, '2026-02-01', 1, 5, NOW(), NOW()),
('CN555444333', 'ImageRUNNER 2520', 'Canon', NULL, '2023-01-20', 'Actif', 'Hall Principal', 2500.00, '2025-01-20', 2, NULL, NOW(), NOW()),
('CS111222333', 'Catalyst 2960', 'Cisco', 'IOS', '2023-01-10', 'Actif', 'Salle Serveur', 1500.00, '2028-01-10', 3, NULL, NOW(), NOW()),
('DL999888777', 'PowerEdge R740', 'Dell', 'Ubuntu Server 22.04', '2023-01-05', 'Actif', 'Salle Serveur', 5000.00, '2028-01-05', 5, NULL, NOW(), NOW());

-- Insert some sample tickets for testing exports
INSERT INTO tickets (titre, description, status, priorite, user_id, technicien_assigne, equipement_id, created_at, updated_at) VALUES 
('Écran bleu au démarrage', 'L\'ordinateur affiche un écran bleu au démarrage', 'Ouvert', 'Haute', 4, 2, 'DL123456789', '2024-01-15 09:30:00', '2024-01-15 09:30:00'),
('Bourrage papier récurrent', 'L\'imprimante se bloque régulièrement avec un bourrage papier', 'En cours', 'Moyenne', 5, 3, 'CN555444333', '2024-01-14 11:20:00', '2024-01-15 08:00:00'),
('Perte de connectivité', 'Le switch perd la connexion de manière intermittente', 'Fermé', 'Critique', 2, 2, 'CS111222333', '2024-01-13 16:45:00', '2024-01-14 17:00:00');

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
