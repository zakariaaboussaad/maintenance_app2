<?php

require_once __DIR__ . '/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Notification;
use App\Models\User;
use App\Models\Ticket;
use App\Services\NotificationService;

echo "=== STATUS CHANGE NOTIFICATION DEBUG ===\n";

try {
    // Find a ticket that has been updated
    $ticket = Ticket::with('user')->where('id', 11)->first(); // Ticket #11 from the logs
    if (!$ticket) {
        echo "Ticket #11 not found\n";
        exit(1);
    }
    
    echo "Found ticket #11:\n";
    echo "- ID: " . $ticket->id . "\n";
    echo "- Title: " . $ticket->titre . "\n";
    echo "- Status: " . $ticket->status . "\n";
    echo "- User ID (creator): " . $ticket->user_id . "\n";
    echo "- Technician ID: " . $ticket->technicien_assigne . "\n";
    
    // Find the technician who updated it
    $technician = User::find($ticket->technicien_assigne);
    if (!$technician) {
        echo "Technician not found\n";
        exit(1);
    }
    
    echo "Technician who updated:\n";
    echo "- ID: " . $technician->id_user . "\n";
    echo "- Name: " . $technician->nom . " " . $technician->prenom . "\n";
    echo "- Email: " . $technician->email . "\n";
    
    // Check current notifications for the ticket creator
    echo "\nCurrent notifications for ticket creator (user_id: " . $ticket->user_id . "):\n";
    $notifications = Notification::where('user_id', $ticket->user_id)
        ->orderBy('created_at', 'desc')
        ->get();
    
    foreach ($notifications as $notification) {
        echo "- ID: " . $notification->id . ", Type: " . $notification->type . ", Created: " . $notification->created_at . "\n";
        echo "  Title: " . $notification->titre . "\n";
        if ($notification->data) {
            echo "  Data: " . json_encode($notification->data) . "\n";
        }
    }
    
    // Test creating a status change notification manually
    echo "\n=== TESTING STATUS CHANGE NOTIFICATION ===\n";
    echo "Simulating status change from 'en_cours' to 'resolu'...\n";
    
    $result = NotificationService::notifyTicketStatusChange($ticket, 'en_cours', 'resolu', $technician);
    
    if ($result) {
        echo "✅ Status change notification created successfully!\n";
        echo "Notification ID: " . $result->id . "\n";
        echo "User ID: " . $result->user_id . "\n";
        echo "Type: " . $result->type . "\n";
        echo "Title: " . $result->titre . "\n";
        echo "Message: " . $result->message . "\n";
        if ($result->data) {
            echo "Data: " . json_encode($result->data) . "\n";
        }
    } else {
        echo "❌ Failed to create status change notification\n";
    }
    
    // Test creating a comment notification manually
    echo "\n=== TESTING COMMENT NOTIFICATION ===\n";
    echo "Simulating comment addition...\n";
    
    $comment = (object) ['contenu' => 'Test comment for debugging notifications'];
    $result2 = NotificationService::notifyCommentAdded($ticket, $comment, $technician);
    
    if ($result2) {
        echo "✅ Comment notification created successfully!\n";
        echo "Notification ID: " . $result2->id . "\n";
        echo "User ID: " . $result2->user_id . "\n";
        echo "Type: " . $result2->type . "\n";
        echo "Title: " . $result2->titre . "\n";
        echo "Message: " . $result2->message . "\n";
        if ($result2->data) {
            echo "Data: " . json_encode($result2->data) . "\n";
        }
    } else {
        echo "❌ Failed to create comment notification\n";
    }
    
    // Check if notifications were actually saved to database
    echo "\n=== VERIFYING DATABASE ===\n";
    $newNotifications = Notification::where('user_id', $ticket->user_id)
        ->where('created_at', '>', now()->subMinutes(1))
        ->get();
    
    echo "New notifications created in last minute: " . $newNotifications->count() . "\n";
    foreach ($newNotifications as $notif) {
        echo "- ID: " . $notif->id . ", Type: " . $notif->type . "\n";
    }
    
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== DEBUG COMPLETE ===\n";
