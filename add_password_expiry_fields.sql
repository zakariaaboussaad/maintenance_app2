USE maintenance_db;

ALTER TABLE users 
ADD COLUMN password_updated_at timestamp NULL DEFAULT NULL,
ADD COLUMN password_expired tinyint(1) NOT NULL DEFAULT 0,
ADD COLUMN password_expiry_notified_at timestamp NULL DEFAULT NULL;
