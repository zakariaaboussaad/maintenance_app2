<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Get ticket 17 that was updated in the logs
$ticket = App\Models\Ticket::find(17);
$admin = App\Models\User::find(1);

if (!$ticket) {
    echo "Ticket 17 not found\n";
    exit;
}

if (!$admin) {
    echo "Admin user not found\n";
    exit;
}

echo "Ticket ID: {$ticket->id}\n";
echo "Ticket user_id: {$ticket->user_id}\n";
echo "Admin id_user: {$admin->id_user}\n";

// Load the user relationship
$ticket->load('user');
if ($ticket->user) {
    echo "Ticket creator: {$ticket->user->email}\n";
} else {
    echo "No user relationship found\n";
}

// Check if user_id matches admin id_user (should be different for notification to work)
if ($ticket->user_id == $admin->id_user) {
    echo "PROBLEM: Same user - notification will be skipped\n";
} else {
    echo "GOOD: Different users - notification should be sent\n";
}

// Try to create a notification manually
echo "\nTesting notification creation...\n";
try {
    $notification = App\Models\Notification::create([
        'user_id' => $ticket->user_id,
        'type' => 'ticket_mis_a_jour',
        'titre' => 'Test notification',
        'message' => 'This is a test notification',
    ]);
    echo "Manual notification created with ID: {$notification->id}\n";
} catch (Exception $e) {
    echo "Error creating notification: " . $e->getMessage() . "\n";
}
