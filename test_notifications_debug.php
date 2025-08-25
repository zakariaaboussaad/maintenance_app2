<?php

require_once __DIR__ . '/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Notification;
use App\Models\User;
use App\Models\Ticket;
use App\Services\NotificationService;

echo "=== NOTIFICATION SYSTEM DEBUG TEST ===\n";

try {
    // Test 1: Check if notifications table exists and has data column
    echo "\n1. Testing database connection and table structure...\n";
    $tableExists = \Schema::hasTable('notifications');
    echo "Notifications table exists: " . ($tableExists ? "YES" : "NO") . "\n";
    
    if ($tableExists) {
        $columns = \Schema::getColumnListing('notifications');
        echo "Table columns: " . implode(', ', $columns) . "\n";
        
        $hasDataColumn = \Schema::hasColumn('notifications', 'data');
        echo "Has 'data' column: " . ($hasDataColumn ? "YES" : "NO") . "\n";
    }
    
    // Test 2: Check notification type ENUM values
    echo "\n2. Testing notification type ENUM values...\n";
    $result = \DB::select("SHOW COLUMNS FROM notifications WHERE Field = 'type'");
    if (!empty($result)) {
        echo "Type column definition: " . $result[0]->Type . "\n";
    }
    
    // Test 3: Find a test ticket and user
    echo "\n3. Finding test data...\n";
    $ticket = Ticket::with('user')->first();
    if (!$ticket) {
        echo "No tickets found in database\n";
        exit(1);
    }
    
    echo "Found ticket ID: " . $ticket->id . "\n";
    echo "Ticket creator user_id: " . $ticket->user_id . "\n";
    
    $technician = User::where('role_id', 3)->first(); // Assuming role_id 3 is technician
    if (!$technician) {
        $technician = User::where('id_user', '!=', $ticket->user_id)->first();
    }
    
    if (!$technician) {
        echo "No technician found for testing\n";
        exit(1);
    }
    
    echo "Found technician ID: " . $technician->id_user . " (" . $technician->email . ")\n";
    
    // Test 4: Try creating a status change notification
    echo "\n4. Testing status change notification...\n";
    $result = NotificationService::notifyTicketStatusChange($ticket, 'en_attente', 'en_cours', $technician);
    echo "Status change notification result: " . ($result ? "SUCCESS (ID: " . $result->id . ")" : "FAILED") . "\n";
    
    // Test 5: Try creating a comment notification
    echo "\n5. Testing comment notification...\n";
    $comment = (object) ['contenu' => 'Test comment for notification debugging'];
    $result2 = NotificationService::notifyCommentAdded($ticket, $comment, $technician);
    echo "Comment notification result: " . ($result2 ? "SUCCESS (ID: " . $result2->id . ")" : "FAILED") . "\n";
    
    // Test 6: Check latest notifications for the ticket creator
    echo "\n6. Checking latest notifications for ticket creator...\n";
    $notifications = Notification::where('user_id', $ticket->user_id)
        ->orderBy('created_at', 'desc')
        ->limit(5)
        ->get();
    
    echo "Found " . $notifications->count() . " notifications for user " . $ticket->user_id . "\n";
    foreach ($notifications as $notification) {
        echo "- ID: " . $notification->id . ", Type: " . $notification->type . ", Created: " . $notification->created_at . "\n";
    }
    
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== TEST COMPLETE ===\n";
