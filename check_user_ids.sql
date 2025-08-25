-- Check user IDs and ticket relationships
SELECT 
    t.id as ticket_id,
    t.titre,
    t.user_id as ticket_creator_id,
    t.technicien_assigne as technician_id,
    u1.nom as creator_name,
    u1.email as creator_email,
    u2.nom as technician_name,
    u2.email as technician_email
FROM tickets t
LEFT JOIN users u1 ON t.user_id = u1.id_user
LEFT JOIN users u2 ON t.technicien_assigne = u2.id_user
WHERE t.id IN (10, 11)
ORDER BY t.id;
