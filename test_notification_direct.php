<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Testing notification creation directly...\n";

try {
    // Get the models
    $ticket = \App\Models\Ticket::find(11);
    $user3 = \App\Models\User::find(3); // Fatima (technician)
    $user5 = \App\Models\User::find(5); // Aicha (ticket creator)
    
    if (!$ticket || !$user3 || !$user5) {
        echo "Missing required data\n";
        exit;
    }
    
    echo "Ticket 11 creator: User {$ticket->user_id}\n";
    echo "Technician: User {$user3->id_user}\n";
    echo "Should notify: User {$user5->id_user}\n";
    
    // Test status change notification
    echo "\nTesting status change notification...\n";
    $result = \App\Services\NotificationService::notifyTicketStatusChange(
        $ticket, 
        'en_cours', 
        'ferme', 
        $user3
    );
    
    if ($result) {
        echo "✅ Status notification created: ID {$result->id}\n";
    } else {
        echo "❌ Status notification failed\n";
    }
    
    // Test comment notification
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
        echo "❌ Comment notification failed\n";
    }
    
    // Check recent notifications for user 5
    echo "\nRecent notifications for user 5:\n";
    $notifications = \App\Models\Notification::where('user_id', 5)
        ->orderBy('date_creation', 'desc')
        ->limit(5)
        ->get();
        
    foreach ($notifications as $n) {
        echo "- ID: {$n->id}, Type: {$n->type}, Title: {$n->titre}\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
}

echo "\nTest complete.\n";
