<?php

require_once 'vendor/autoload.php';

use App\Models\Ticket;
use App\Models\User;
use App\Services\NotificationService;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Testing Status Change Notification ===\n";

// Get ticket 11 and user 5 (Aicha - ticket creator)
$ticket = Ticket::find(11);
$user5 = User::find(5); // Aicha - ticket creator
$user3 = User::find(3); // Fatima - technician

if (!$ticket) {
    echo "❌ Ticket 11 not found\n";
    exit;
}

if (!$user5) {
    echo "❌ User 5 not found\n";
    exit;
}

if (!$user3) {
    echo "❌ User 3 not found\n";
    exit;
}

echo "📋 Ticket Info:\n";
echo "  - ID: {$ticket->id}\n";
echo "  - Title: {$ticket->titre}\n";
echo "  - Current Status: {$ticket->status}\n";
echo "  - Creator (user_id): {$ticket->user_id}\n";
echo "  - Assigned Tech: {$ticket->technicien_assigne}\n";

echo "\n👥 User Info:\n";
echo "  - Ticket Creator: {$user5->prenom} {$user5->nom} (ID: {$user5->id_user})\n";
echo "  - Technician: {$user3->prenom} {$user3->nom} (ID: {$user3->id_user})\n";

echo "\n🔍 User Comparison:\n";
echo "  - ticket->user_id: {$ticket->user_id} (type: " . gettype($ticket->user_id) . ")\n";
echo "  - user3->id_user: {$user3->id_user} (type: " . gettype($user3->id_user) . ")\n";
echo "  - Are they equal (==): " . ($ticket->user_id == $user3->id_user ? 'YES' : 'NO') . "\n";
echo "  - Are they identical (===): " . ($ticket->user_id === $user3->id_user ? 'YES' : 'NO') . "\n";

echo "\n🔔 Testing Notification Creation:\n";
$oldStatus = $ticket->status;
$newStatus = 'ferme'; // Change to a different status

echo "  - Simulating status change: {$oldStatus} -> {$newStatus}\n";
echo "  - Updated by: {$user3->prenom} {$user3->nom} (ID: {$user3->id_user})\n";
echo "  - Notification should go to: {$user5->prenom} {$user5->nom} (ID: {$user5->id_user})\n";

// Test the notification service
echo "\n📡 Calling NotificationService::notifyTicketStatusChange...\n";
$result = NotificationService::notifyTicketStatusChange($ticket, $oldStatus, $newStatus, $user3);

if ($result) {
    echo "✅ Notification created successfully!\n";
    echo "  - Notification ID: {$result->id}\n";
    echo "  - Type: {$result->type}\n";
    echo "  - User ID: {$result->user_id}\n";
    echo "  - Title: {$result->titre}\n";
    echo "  - Message: {$result->message}\n";
} else {
    echo "❌ Notification creation FAILED\n";
}

// Check recent notifications for user 5
echo "\n📋 Recent notifications for user 5:\n";
$notifications = \App\Models\Notification::where('user_id', 5)->orderBy('date_creation', 'desc')->limit(5)->get();
foreach ($notifications as $notif) {
    echo "  - ID: {$notif->id}, Type: {$notif->type}, Title: {$notif->titre}, Created: {$notif->date_creation}\n";
}

echo "\n=== Test Complete ===\n";
