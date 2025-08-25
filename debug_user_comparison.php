<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Testing User Comparison Logic ===\n";

// Get the relevant data
$ticket = \App\Models\Ticket::find(11);
$user3 = \App\Models\User::find(3); // Fatima (technician)
$user5 = \App\Models\User::find(5); // Aicha (ticket creator)

if (!$ticket || !$user3 || !$user5) {
    echo "Missing data\n";
    exit;
}

echo "Ticket 11 Details:\n";
echo "- ID: {$ticket->id}\n";
echo "- Title: {$ticket->titre}\n";
echo "- Creator (user_id): {$ticket->user_id} (type: " . gettype($ticket->user_id) . ")\n";
echo "- Current Status: {$ticket->status}\n";

echo "\nUser Details:\n";
echo "- Technician (user 3): {$user3->prenom} {$user3->nom}\n";
echo "  - id_user: {$user3->id_user} (type: " . gettype($user3->id_user) . ")\n";
echo "- Ticket Creator (user 5): {$user5->prenom} {$user5->nom}\n";
echo "  - id_user: {$user5->id_user} (type: " . gettype($user5->id_user) . ")\n";

echo "\nUser Comparison Tests:\n";
echo "- ticket->user_id == user3->id_user: " . ($ticket->user_id == $user3->id_user ? 'TRUE' : 'FALSE') . "\n";
echo "- ticket->user_id === user3->id_user: " . ($ticket->user_id === $user3->id_user ? 'TRUE' : 'FALSE') . "\n";
echo "- ticket->user_id == user5->id_user: " . ($ticket->user_id == $user5->id_user ? 'TRUE' : 'FALSE') . "\n";
echo "- ticket->user_id === user5->id_user: " . ($ticket->user_id === $user5->id_user ? 'TRUE' : 'FALSE') . "\n";

echo "\nNotification Logic Test:\n";
if (!$ticket->user_id) {
    echo "❌ No ticket user_id\n";
} elseif ($ticket->user_id == $user3->id_user) {
    echo "❌ SKIPPING: Technician is ticket owner (this should NOT happen)\n";
} else {
    echo "✅ SHOULD PROCEED: Different users - notification should be sent\n";
}

// Test direct notification creation
echo "\nTesting Direct Notification Creation:\n";
try {
    $notification = \App\Models\Notification::create([
        'user_id' => 5,
        'type' => 'ticket_mis_a_jour',
        'titre' => 'Test Status Change',
        'message' => 'Test status change notification',
        'lu' => false,
        'date_creation' => now(),
        'priorite' => 'normale',
        'data' => json_encode(['test' => true])
    ]);
    echo "✅ Direct notification created: ID {$notification->id}\n";
} catch (Exception $e) {
    echo "❌ Direct notification failed: " . $e->getMessage() . "\n";
}

echo "\n=== Test Complete ===\n";
