-- Fix notification ENUM to include all required notification types
-- Run this in phpMyAdmin SQL tab for maintenance_db database

ALTER TABLE `notifications` 
MODIFY COLUMN `type` ENUM(
    'ticket_nouveau',
    'ticket_assigne', 
    'ticket_mis_a_jour',
    'ticket_ferme',
    'commentaire_ajoute',
    'panne_signale',
    'panne_resolue',
    'intervention_planifiee',
    'system'
) NOT NULL;

-- Verify the ENUM was updated correctly
SHOW COLUMNS FROM `notifications` LIKE 'type';
