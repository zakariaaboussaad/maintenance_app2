<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Testing Notification Creation for User 5 ===\n";

// Get ticket 11 and users
$ticket = \App\Models\Ticket::find(11);
$user3 = \App\Models\User::find(3); // Fatima (technician)

if (!$ticket || !$user3) {
    echo "Missing data\n";
    exit;
}

echo "Testing status change notification...\n";
echo "Ticket creator: {$ticket->user_id}\n";
echo "Technician: {$user3->id_user}\n";

// Force create a status change notification
$result = \App\Services\NotificationService::notifyTicketStatusChange(
    $ticket, 
    'en_cours', 
    'ferme', 
    $user3
);

if ($result) {
    echo "✅ Status notification created: ID {$result->id}\n";
} else {
    echo "❌ Status notification FAILED\n";
}

// Force create a comment notification
echo "\nTesting comment notification...\n";
$comment = (object) ['contenu' => 'Test comment from technician'];
$result2 = \App\Services\NotificationService::notifyCommentAdded(
    $ticket,
    $comment,
    $user3
);

if ($result2) {
    echo "✅ Comment notification created: ID {$result2->id}\n";
} else {
    echo "❌ Comment notification FAILED\n";
}

echo "\nDone.\n";
