USE maintenance_db;

CREATE TABLE password_resets (
  id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  nom varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  token varchar(255) NOT NULL,
  status enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  reason text DEFAULT NULL,
  new_password varchar(255) DEFAULT NULL,
  rejection_reason text DEFAULT NULL,
  approved_by bigint(20) UNSIGNED DEFAULT NULL,
  rejected_by bigint(20) UNSIGNED DEFAULT NULL,
  approved_at timestamp NULL DEFAULT NULL,
  rejected_at timestamp NULL DEFAULT NULL,
  created_at timestamp NULL DEFAULT NULL,
  updated_at timestamp NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY password_resets_email_index (email),
  KEY password_resets_token_index (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
