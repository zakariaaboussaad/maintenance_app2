<?php

// Simple debug script to test notification creation
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Debug Notification Creation ===\n";

// Test direct notification creation
try {
    $notification = \App\Models\Notification::createForUser(
        5, // user_id (Aicha)
        'ticket_mis_a_jour', // type
        'Test Status Change', // title
        'This is a test notification for status change', // message
        ['test' => true] // data
    );
    
    if ($notification) {
        echo "✅ Direct notification creation SUCCESS\n";
        echo "   ID: {$notification->id}\n";
        echo "   User ID: {$notification->user_id}\n";
        echo "   Type: {$notification->type}\n";
        echo "   Title: {$notification->titre}\n";
    } else {
        echo "❌ Direct notification creation FAILED\n";
    }
} catch (Exception $e) {
    echo "❌ Exception during notification creation: " . $e->getMessage() . "\n";
    echo "   File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
}

// Test comment notification
try {
    $notification2 = \App\Models\Notification::createForUser(
        5, // user_id (Aicha)
        'commentaire_ajoute', // type
        'Test Comment', // title
        'This is a test notification for comment', // message
        ['test' => true] // data
    );
    
    if ($notification2) {
        echo "✅ Comment notification creation SUCCESS\n";
        echo "   ID: {$notification2->id}\n";
        echo "   User ID: {$notification2->user_id}\n";
        echo "   Type: {$notification2->type}\n";
        echo "   Title: {$notification2->titre}\n";
    } else {
        echo "❌ Comment notification creation FAILED\n";
    }
} catch (Exception $e) {
    echo "❌ Exception during comment notification creation: " . $e->getMessage() . "\n";
    echo "   File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
}

echo "\n=== Recent notifications for user 5 ===\n";
$notifications = \App\Models\Notification::where('user_id', 5)->orderBy('date_creation', 'desc')->limit(10)->get();
foreach ($notifications as $notif) {
    echo "ID: {$notif->id}, Type: {$notif->type}, Title: {$notif->titre}, Created: {$notif->date_creation}\n";
}

echo "\n=== Debug Complete ===\n";
