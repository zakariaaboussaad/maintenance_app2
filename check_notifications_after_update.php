<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Checking Notifications After Ticket Updates ===\n";

// Check tickets 11 and 12 details
$ticket11 = \App\Models\Ticket::find(11);
$ticket12 = \App\Models\Ticket::find(12);

echo "Ticket 11 Details:\n";
echo "- Creator: {$ticket11->user_id}\n";
echo "- Current Status: {$ticket11->status}\n";
echo "- Title: {$ticket11->titre}\n";

echo "\nTicket 12 Details:\n";
echo "- Creator: {$ticket12->user_id}\n";
echo "- Current Status: {$ticket12->status}\n";
echo "- Title: {$ticket12->titre}\n";

// Check notifications for ticket 11 creator
if ($ticket11->user_id) {
    $notifications11 = \App\Models\Notification::where('user_id', $ticket11->user_id)
        ->orderBy('date_creation', 'desc')
        ->limit(5)
        ->get();
    
    echo "\nRecent notifications for ticket 11 creator (user {$ticket11->user_id}):\n";
    foreach ($notifications11 as $n) {
        echo "- ID: {$n->id}, Type: {$n->type}, Title: {$n->titre}, Created: {$n->date_creation}\n";
    }
    
    $totalCount11 = \App\Models\Notification::where('user_id', $ticket11->user_id)->count();
    echo "Total notifications: {$totalCount11}\n";
}

// Check notifications for ticket 12 creator
if ($ticket12->user_id) {
    $notifications12 = \App\Models\Notification::where('user_id', $ticket12->user_id)
        ->orderBy('date_creation', 'desc')
        ->limit(5)
        ->get();
    
    echo "\nRecent notifications for ticket 12 creator (user {$ticket12->user_id}):\n";
    foreach ($notifications12 as $n) {
        echo "- ID: {$n->id}, Type: {$n->type}, Title: {$n->titre}, Created: {$n->date_creation}\n";
    }
    
    $totalCount12 = \App\Models\Notification::where('user_id', $ticket12->user_id)->count();
    echo "Total notifications: {$totalCount12}\n";
}

// Check for any new notifications created in the last 5 minutes
$recentNotifications = \App\Models\Notification::where('date_creation', '>=', now()->subMinutes(5))
    ->orderBy('date_creation', 'desc')
    ->get();

echo "\nAll notifications created in last 5 minutes:\n";
foreach ($recentNotifications as $n) {
    echo "- ID: {$n->id}, User: {$n->user_id}, Type: {$n->type}, Title: {$n->titre}, Created: {$n->date_creation}\n";
}

echo "\n=== Check Complete ===\n";
