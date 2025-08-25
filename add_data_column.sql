-- Add data column to notifications table
ALTER TABLE `notifications` ADD COLUMN `data` JSON NULL AFTER `priorite`;

-- Verify the column was added
DESCRIBE `notifications`;
