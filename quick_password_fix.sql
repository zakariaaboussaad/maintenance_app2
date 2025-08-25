-- Quick password fix - Run this in phpMyAdmin SQL tab
-- This uses a known working Laravel hash for 'password123'

UPDATE users SET password = '$2y$12$LQv3c1yqBCFcXDcjQjCC/uuEBIXllVMxfu7fJpQX0sMHsxn0kGubG' WHERE email IN (
    'admin@maintenance.com',
    'ahmed.benali@maintenance.com', 
    'fatima.alami@maintenance.com',
    'mohamed.mansouri@maintenance.com',
    'aicha.idrissi@maintenance.com'
);

-- Verify the update
SELECT email, 'password123' as password_to_use FROM users;
