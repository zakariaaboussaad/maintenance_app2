<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Applying Notification ENUM Fix ===\n";

try {
    // Apply the ENUM fix
    $sql = "ALTER TABLE notifications MODIFY COLUMN type ENUM(
        'ticket_nouveau',
        'ticket_assigne', 
        'ticket_mis_a_jour',
        'ticket_ferme',
        'commentaire_ajoute',
        'panne_signale',
        'panne_resolue',
        'intervention_planifiee',
        'system'
    ) NOT NULL";
    
    DB::statement($sql);
    echo "✅ ENUM fix applied successfully\n";
    
    // Verify the fix
    $result = DB::select("SHOW COLUMNS FROM notifications LIKE 'type'");
    if ($result) {
        echo "✅ ENUM verification:\n";
        echo "Column: " . $result[0]->Field . "\n";
        echo "Type: " . $result[0]->Type . "\n";
    }
    
    // Test creating a status change notification
    echo "\nTesting notification creation...\n";
    $testNotification = \App\Models\Notification::create([
        'user_id' => 5,
        'type' => 'ticket_mis_a_jour',
        'titre' => 'Test Status Change After ENUM Fix',
        'message' => 'Testing if status change notifications work after ENUM fix',
        'lu' => false,
        'date_creation' => now(),
        'priorite' => 'normale',
        'data' => json_encode(['test' => true])
    ]);
    
    echo "✅ Test notification created: ID {$testNotification->id}\n";
    
    // Test creating a comment notification
    $testComment = \App\Models\Notification::create([
        'user_id' => 5,
        'type' => 'commentaire_ajoute',
        'titre' => 'Test Comment After ENUM Fix',
        'message' => 'Testing if comment notifications work after ENUM fix',
        'lu' => false,
        'date_creation' => now(),
        'priorite' => 'normale',
        'data' => json_encode(['test' => true])
    ]);
    
    echo "✅ Test comment notification created: ID {$testComment->id}\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n=== ENUM Fix Complete ===\n";
