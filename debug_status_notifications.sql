-- Clean up test notification
DELETE FROM notifications WHERE id = 7;

-- Check Laravel logs for status change notification debugging
-- Look for these log entries when tech changes ticket status:
-- "=== STATUS CHANGED - SENDING NOTIFICATION ==="
-- "Status change notification result: SUCCESS/FAILED"
-- "Notification created successfully"

-- To test status notifications manually, try changing ticket status and check logs
