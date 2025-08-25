<?php

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;
use App\Models\Notification;

// Database configuration
$capsule = new Capsule;
$capsule->addConnection([
    'driver' => 'mysql',
    'host' => '127.0.0.1',
    'database' => 'maintenance_db',
    'username' => 'root',
    'password' => '',
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

echo "Testing Notification Mark as Read Functionality\n";
echo "==============================================\n\n";

try {
    // Test finding notification by ID
    $notificationId = 10; // Test notification from database
    echo "Looking for notification ID: $notificationId\n";
    
    $notification = Notification::find($notificationId);
    
    if ($notification) {
        echo "✅ Notification found successfully!\n";
        echo "   ID: {$notification->id}\n";
        echo "   Title: {$notification->titre}\n";
        echo "   User ID: {$notification->user_id}\n";
        echo "   Read Status: " . ($notification->lu ? 'Read' : 'Unread') . "\n\n";
        
        // Test marking as read
        if (!$notification->lu) {
            echo "Marking notification as read...\n";
            $notification->markAsRead();
            echo "✅ Notification marked as read successfully!\n";
            
            // Verify the change
            $notification->refresh();
            echo "   New Read Status: " . ($notification->lu ? 'Read' : 'Unread') . "\n";
        } else {
            echo "Notification is already marked as read.\n";
        }
        
    } else {
        echo "❌ Notification not found with ID: $notificationId\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\nTest completed.\n";
