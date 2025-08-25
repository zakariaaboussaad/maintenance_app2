<?php

require_once 'vendor/autoload.php';

try {
    $app = require_once 'bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    echo "=== Testing Notification Creation ===\n";
    
    // Test 1: Direct notification creation
    echo "\n1. Testing direct notification creation...\n";
    $user = App\Models\User::where('email', 'admin@maintenance.com')->first();
    if (!$user) {
        echo "❌ User not found\n";
        exit(1);
    }
    echo "✅ User found: {$user->email} (ID: {$user->id_user})\n";
    
    $notification = App\Models\Notification::create([
        'titre' => 'Test Direct Creation',
        'message' => 'This is a direct test notification',
        'type' => 'system',
        'user_id' => $user->id_user,
        'lu' => false,
        'date_creation' => now()
    ]);
    echo "✅ Direct notification created: ID {$notification->id_notification}\n";
    
    // Test 2: Using createForUser method
    echo "\n2. Testing createForUser method...\n";
    $notification2 = App\Models\Notification::createForUser(
        $user->id_user,
        'system',
        'Test CreateForUser',
        'This is a test using createForUser method'
    );
    echo "✅ CreateForUser notification created: ID {$notification2->id_notification}\n";
    
    // Test 3: Using NotificationService
    echo "\n3. Testing NotificationService...\n";
    $result = App\Services\NotificationService::sendTestNotification($user);
    echo "✅ NotificationService test result: {$result} notifications created\n";
    
    // Check total notifications
    $count = App\Models\Notification::count();
    echo "\n✅ Total notifications in database: {$count}\n";
    
    // List all notifications
    $notifications = App\Models\Notification::orderBy('id_notification', 'desc')->take(5)->get();
    echo "\nRecent notifications:\n";
    foreach ($notifications as $notif) {
        echo "- ID: {$notif->id_notification}, Title: {$notif->titre}, User: {$notif->user_id}, Type: {$notif->type}\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
