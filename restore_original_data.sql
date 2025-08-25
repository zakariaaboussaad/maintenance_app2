-- Restore your original data from DatabaseSeeder
-- Run this in phpMyAdmin SQL tab

-- Clear existing data first (in correct order to avoid foreign key issues)
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM pannes;
DELETE FROM equipements;
DELETE FROM users;
DELETE FROM type_equipements;
DELETE FROM categories;
DELETE FROM status_pannes;
DELETE FROM roles;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert your original roles
INSERT INTO roles (id_role, nom, description, permissions, is_active, created_at, updated_at) VALUES 
(1, 'admin', 'Administrateur système avec tous les droits', '["create","read","update","delete","manage_users","reports"]', 1, NOW(), NOW()),
(2, 'technicien', 'Technicien de maintenance', '["create","read","update","interventions","equipment"]', 1, NOW(), NOW()),
(3, 'utilisateur', 'Utilisateur standard - peut créer des tickets', '["read","create_ticket","view_own_tickets"]', 1, NOW(), NOW());

-- Insert your original users (the ones you had)
INSERT INTO users (id_user, nom, prenom, matricule, email, password, numero_telephone, poste_affecte, role_id, is_active, date_embauche, created_at, updated_at) VALUES 
(1, 'Admin', 'System', 'ADM001', 'admin@maintenance.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+212600000001', 'Direction IT', 1, 1, '2023-01-01', NOW(), NOW()),
(2, 'Benali', 'Ahmed', 'TECH001', 'ahmed.benali@maintenance.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+212600000002', 'Service Technique', 2, 1, '2023-02-15', NOW(), NOW()),
(3, 'Alami', 'Fatima', 'TECH002', 'fatima.alami@maintenance.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+212600000003', 'Service Technique', 2, 1, '2023-03-10', NOW(), NOW()),
(4, 'Mansouri', 'Mohamed', 'USER001', 'mohamed.mansouri@maintenance.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+212600000004', 'Comptabilité', 3, 1, '2023-04-05', NOW(), NOW()),
(5, 'Idrissi', 'Aicha', 'USER002', 'aicha.idrissi@maintenance.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+212600000005', 'Ressources Humaines', 3, 1, '2023-05-20', NOW(), NOW());

-- Insert your original equipment types
INSERT INTO type_equipements (id_type, nom_type, description, is_active) VALUES 
(1, 'Ordinateur', 'Ordinateurs de bureau et portables', 1),
(2, 'Imprimante', 'Imprimantes laser et jet d\'encre', 1),
(3, 'Réseau', 'Équipements réseau (routeurs, switches)', 1),
(4, 'Téléphone', 'Téléphones fixes et systèmes de communication', 1),
(5, 'Serveur', 'Serveurs et équipements datacenter', 1);

-- Insert your original equipment
INSERT INTO equipements (numero_serie, modele, marque, os, date_installation, status, localisation, prix_achat, date_garantie, type_equipement_id, utilisateur_assigne, created_at, updated_at) VALUES 
('DL123456789', 'OptiPlex 3080', 'Dell', 'Windows 11', '2023-01-15', 'Actif', 'Bureau Comptabilité', 899.99, '2026-01-15', 1, 4, NOW(), NOW()),
('HP987654321', 'EliteDesk 800', 'HP', 'Windows 11', '2023-02-01', 'Actif', 'Bureau RH', 1299.99, '2026-02-01', 1, 5, NOW(), NOW()),
('CN555444333', 'ImageRUNNER 2520', 'Canon', NULL, '2023-01-20', 'Actif', 'Hall Principal', 2500.00, '2025-01-20', 2, NULL, NOW(), NOW()),
('CS111222333', 'Catalyst 2960', 'Cisco', 'IOS', '2023-01-10', 'Actif', 'Salle Serveur', 1500.00, '2028-01-10', 3, NULL, NOW(), NOW()),
('DL999888777', 'PowerEdge R740', 'Dell', 'Ubuntu Server 22.04', '2023-01-05', 'Actif', 'Salle Serveur', 5000.00, '2028-01-05', 5, NULL, NOW(), NOW());

-- Insert categories
INSERT INTO categories (id, nom, description, is_active, created_at, updated_at) VALUES 
(1, 'Hardware', 'Problèmes matériels', 1, NOW(), NOW()),
(2, 'Software', 'Problèmes logiciels', 1, NOW(), NOW()),
(3, 'Réseau', 'Problèmes de connectivité réseau', 1, NOW(), NOW()),
(4, 'Impression', 'Problèmes d\'impression', 1, NOW(), NOW());

-- Insert status pannes
INSERT INTO status_pannes (id, nom, description, couleur, is_final, created_at, updated_at) VALUES 
(1, 'Ouverte', 'Panne signalée, en attente de traitement', '#ff6b6b', 0, NOW(), NOW()),
(2, 'En cours', 'Panne en cours de traitement', '#ffa726', 0, NOW(), NOW()),
(3, 'Résolue', 'Panne résolue avec succès', '#66bb6a', 1, NOW(), NOW()),
(4, 'Fermée', 'Panne fermée définitivement', '#78909c', 1, NOW(), NOW());

-- Insert your original pannes
INSERT INTO pannes (titre, description, date_panne, date_detection, severite, type_panne, equipement_id, status_panne_id, detecte_par, cause_probable, solution_temporaire, panne_recurrente, created_at, updated_at) VALUES 
('Écran bleu au démarrage', 'L\'ordinateur affiche un écran bleu au démarrage avec le message "SYSTEM_THREAD_EXCEPTION_NOT_HANDLED"', '2025-08-01 09:30:00', '2025-08-01 09:30:00', 'majeure', 'hardware', 'DL123456789', 3, 4, 'Problème de pilote ou défaillance matérielle', 'Redémarrage en mode sans échec', 0, NOW(), NOW()),
('Bourrage papier récurrent', 'L\'imprimante se bloque régulièrement avec un bourrage papier, même après nettoyage', '2025-08-02 11:20:00', '2025-08-02 11:20:00', 'moyenne', 'hardware', 'CN555444333', 2, 5, 'Usure des rouleaux d\'entraînement', 'Nettoyage manuel régulier', 1, NOW(), NOW()),
('Perte de connectivité intermittente', 'Le switch perd la connexion de manière intermittente, affectant plusieurs postes', '2025-08-04 16:45:00', '2025-08-04 16:45:00', 'critique', 'reseau', 'CS111222333', 1, 2, 'Surchauffe ou défaillance port', 'Redémarrage du switch', 0, NOW(), NOW());

-- Check final counts
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'equipements', COUNT(*) FROM equipements  
UNION ALL
SELECT 'pannes', COUNT(*) FROM pannes
UNION ALL
SELECT 'roles', COUNT(*) FROM roles
UNION ALL
SELECT 'type_equipements', COUNT(*) FROM type_equipements;
