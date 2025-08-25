-- Test if ticket_mis_a_jour ENUM value works
-- If this fails, the ENUM is missing this value

INSERT INTO notifications (titre, message, type, user_id, date_creation, lu, priorite, created_at, updated_at) 
VALUES ('Test Status Change', 'Test message', 'ticket_mis_a_jour', 4, NOW(), 0, 'normale', NOW(), NOW());
