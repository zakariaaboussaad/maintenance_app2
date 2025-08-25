-- Check current ENUM values for notifications.type column
SHOW COLUMNS FROM notifications LIKE 'type';

-- Check if ticket_mis_a_jour and commentaire_ajoute are in the ENUM
SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'maintenance_db' 
AND TABLE_NAME = 'notifications' 
AND COLUMN_NAME = 'type';
