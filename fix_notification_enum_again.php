<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    echo "=== CHECKING NOTIFICATION ENUM ===\n";
    $result = DB::select('SHOW COLUMNS FROM notifications LIKE "type"');
    if (!empty($result)) {
        $typeColumn = $result[0];
        echo "Current ENUM: " . $typeColumn->Type . "\n";
        
        if (strpos($typeColumn->Type, 'ticket_mis_a_jour') !== false && strpos($typeColumn->Type, 'commentaire_ajoute') !== false) {
            echo "✅ ENUM contains required notification types\n";
        } else {
            echo "❌ ENUM missing notification types - applying fix...\n";
            DB::statement("ALTER TABLE notifications MODIFY COLUMN type ENUM(
                'ticket_nouveau',
                'ticket_assigne', 
                'ticket_mis_a_jour',
                'ticket_ferme',
                'commentaire_ajoute',
                'panne_signale',
                'panne_resolue',
                'intervention_planifiee',
                'system',
                'password_request',
                'password_reset_request',
                'password_reset_approved',
                'password_reset_rejected',
                'password_changed',
                'password_rejected'
            )");
            echo "✅ ENUM fixed successfully\n";
        }
    }
    
    // Test creating a notification
    echo "\n=== TESTING NOTIFICATION CREATION ===\n";
    $testNotification = App\Models\Notification::create([
        'user_id' => 5,
        'type' => 'ticket_mis_a_jour',
        'titre' => 'Test Status Change',
        'message' => 'Testing status change notification after fix',
        'lu' => false,
        'date_creation' => now()
    ]);
    
    if ($testNotification) {
        echo "✅ Test notification created successfully with ID: " . $testNotification->id . "\n";
        $testNotification->delete(); // Clean up
    } else {
        echo "❌ Failed to create test notification\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
