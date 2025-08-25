<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== DEBUGGING NOTIFICATIONS ===\n";

// Check recent tickets
echo "Recent tickets:\n";
$tickets = App\Models\Ticket::with('user')->latest()->take(3)->get();
foreach($tickets as $ticket) {
    echo "Ticket ID: {$ticket->id}, User ID: {$ticket->user_id}, User: " . ($ticket->user ? $ticket->user->email : 'null') . "\n";
}

// Check recent notifications
echo "\nRecent notifications:\n";
$notifications = App\Models\Notification::latest()->take(5)->get();
foreach($notifications as $notif) {
    echo "ID: {$notif->id}, User: {$notif->user_id}, Type: {$notif->type}, Created: {$notif->created_at}\n";
}

// Test notification creation directly
echo "\n=== TESTING NOTIFICATION CREATION ===\n";
$ticket = App\Models\Ticket::find(17); // The ticket that was updated
$admin = App\Models\User::find(1);

if ($ticket && $admin) {
    echo "Testing with Ticket {$ticket->id} (user_id: {$ticket->user_id}) updated by Admin {$admin->id_user}\n";
    
    try {
        $result = App\Services\NotificationService::notifyTicketStatusChange($ticket, 'en_cours', 'resolu', $admin);
        echo "Notification service result: " . ($result ? 'SUCCESS' : 'FAILED') . "\n";
        
        // Check if notification was created
        $newNotifications = App\Models\Notification::where('user_id', $ticket->user_id)->latest()->first();
        if ($newNotifications) {
            echo "Latest notification for user {$ticket->user_id}: ID {$newNotifications->id}, Type: {$newNotifications->type}\n";
        } else {
            echo "No notifications found for user {$ticket->user_id}\n";
        }
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
} else {
    echo "Could not find ticket 17 or admin user\n";
}
