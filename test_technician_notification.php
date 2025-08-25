<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Ticket;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Log;

echo "=== TESTING TECHNICIAN ASSIGNMENT NOTIFICATIONS ===\n";

try {
    // Get ticket 18 (user_id: 5)
    $ticket = Ticket::with('user')->find(18);
    if (!$ticket) {
        echo "❌ Ticket 18 not found\n";
        exit;
    }
    
    // Get admin user (id: 1)
    $admin = User::where('id_user', 1)->first();
    if (!$admin) {
        echo "❌ Admin user not found\n";
        exit;
    }
    
    // Get a technician user (role_id = 3)
    $technician = User::where('role_id', 3)->first();
    if (!$technician) {
        echo "❌ No technician found\n";
        exit;
    }
    
    echo "✅ Found ticket: ID {$ticket->id}, User ID: {$ticket->user_id}\n";
    echo "✅ Found admin: ID {$admin->id_user}, Name: {$admin->nom} {$admin->prenom}\n";
    echo "✅ Found technician: ID {$technician->id_user}, Name: {$technician->nom} {$technician->prenom}\n";
    
    echo "\n=== TESTING TECHNICIAN ASSIGNMENT NOTIFICATION ===\n";
    
    // Test the notification service directly
    $result = NotificationService::notifyTicketAssigned($ticket, $technician, $admin);
    
    if ($result) {
        echo "✅ Technician assignment notification created successfully!\n";
        echo "Notification ID: {$result->id}\n";
        echo "User ID: {$result->user_id}\n";
        echo "Type: {$result->type}\n";
        echo "Title: {$result->titre}\n";
        echo "Message: {$result->message}\n";
    } else {
        echo "❌ Technician assignment notification FAILED\n";
    }
    
    // Check all notifications for the technician
    echo "\n=== ALL NOTIFICATIONS FOR TECHNICIAN {$technician->id_user} ===\n";
    $notifications = \App\Models\Notification::where('user_id', $technician->id_user)->orderBy('created_at', 'desc')->get();
    
    echo "Total notifications: " . $notifications->count() . "\n";
    foreach ($notifications as $notif) {
        echo "- ID: {$notif->id}, Type: {$notif->type}, Title: {$notif->titre}, Created: {$notif->created_at}\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== TEST COMPLETE ===\n";
