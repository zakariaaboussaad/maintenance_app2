<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== MANUAL NOTIFICATION TEST ===\n";

// Get ticket 18 (user_id = 5) and admin user (id_user = 1)
$ticket = App\Models\Ticket::find(18);
$admin = App\Models\User::find(1);

if (!$ticket || !$admin) {
    echo "ERROR: Could not find ticket 18 or admin user\n";
    exit(1);
}

echo "Ticket 18 details:\n";
echo "- ID: {$ticket->id}\n";
echo "- User ID: {$ticket->user_id}\n";
echo "- Current Status: {$ticket->status}\n";

echo "\nAdmin details:\n";
echo "- ID: {$admin->id_user}\n";
echo "- Email: {$admin->email}\n";

// Test 1: Try to create a notification manually
echo "\n=== TEST 1: Manual Notification Creation ===\n";
try {
    $notification = App\Models\Notification::create([
        'user_id' => $ticket->user_id,
        'type' => 'ticket_mis_a_jour',
        'titre' => 'Test Manual Notification',
        'message' => 'This is a test notification created manually',
        'date_creation' => now(),
        'lu' => false
    ]);
    echo "✅ Manual notification created successfully with ID: {$notification->id}\n";
} catch (Exception $e) {
    echo "❌ Failed to create manual notification: " . $e->getMessage() . "\n";
}

// Test 2: Try the notification service
echo "\n=== TEST 2: NotificationService Test ===\n";
try {
    $result = App\Services\NotificationService::notifyTicketStatusChange($ticket, 'resolu', 'ferme', $admin);
    echo "NotificationService result: " . ($result ? "✅ SUCCESS" : "❌ FAILED") . "\n";
    
    if ($result) {
        echo "Notification details:\n";
        echo "- ID: {$result->id}\n";
        echo "- User ID: {$result->user_id}\n";
        echo "- Type: {$result->type}\n";
        echo "- Title: {$result->titre}\n";
    }
} catch (Exception $e) {
    echo "❌ NotificationService error: " . $e->getMessage() . "\n";
}

// Test 3: Check all notifications for user 5
echo "\n=== TEST 3: All Notifications for User 5 ===\n";
$notifications = App\Models\Notification::where('user_id', 5)->orderBy('created_at', 'desc')->get();
echo "Total notifications for user 5: " . $notifications->count() . "\n";
foreach ($notifications as $notif) {
    echo "- ID: {$notif->id}, Type: {$notif->type}, Created: {$notif->created_at}\n";
}

echo "\n=== TEST COMPLETE ===\n";
