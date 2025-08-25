<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== CHECKING TYPE COLUMN ===\n";

try {
    // Get the exact column definition
    $result = DB::select("SHOW COLUMNS FROM notifications WHERE Field = 'type'");
    
    if (!empty($result)) {
        $typeColumn = $result[0];
        echo "Current type column: {$typeColumn->Type}\n";
        
        // Check if it's an ENUM and what values it contains
        if (strpos($typeColumn->Type, 'enum') !== false) {
            echo "✅ Type is ENUM\n";
            echo "Values: {$typeColumn->Type}\n";
            
            // Check if ticket_mis_a_jour is in the enum
            if (strpos($typeColumn->Type, 'ticket_mis_a_jour') !== false) {
                echo "✅ ticket_mis_a_jour is in ENUM\n";
            } else {
                echo "❌ ticket_mis_a_jour is NOT in ENUM\n";
                
                // Add the missing value
                echo "\n=== FIXING ENUM ===\n";
                DB::statement("ALTER TABLE notifications MODIFY COLUMN type ENUM(
                    'ticket_nouveau',
                    'ticket_assigne', 
                    'ticket_mis_a_jour',
                    'ticket_ferme',
                    'commentaire_ajoute',
                    'panne_signale',
                    'panne_resolue', 
                    'intervention_planifiee',
                    'system'
                )");
                echo "✅ ENUM updated with all values\n";
            }
        } else {
            echo "❌ Type is not ENUM: {$typeColumn->Type}\n";
        }
    }
    
    // Test notification creation
    echo "\n=== TESTING NOTIFICATION ===\n";
    
    $testResult = DB::table('notifications')->insert([
        'user_id' => 5,
        'type' => 'ticket_mis_a_jour',
        'titre' => 'Test Fix',
        'message' => 'Testing after schema fix',
        'date_creation' => now(),
        'lu' => false,
        'created_at' => now(),
        'updated_at' => now()
    ]);
    
    if ($testResult) {
        echo "✅ Successfully created notification!\n";
        
        // Verify it was created
        $notification = DB::table('notifications')
            ->where('titre', 'Test Fix')
            ->first();
            
        if ($notification) {
            echo "✅ Notification verified in database\n";
            echo "ID: {$notification->id}, Type: {$notification->type}\n";
            
            // Clean up
            DB::table('notifications')->where('id', $notification->id)->delete();
            echo "🧹 Test notification cleaned up\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n=== SCHEMA FIX COMPLETE ===\n";
