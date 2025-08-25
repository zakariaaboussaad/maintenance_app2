<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "=== CHECKING NOTIFICATIONS TABLE SCHEMA ===\n";

try {
    // Check if table exists
    if (Schema::hasTable('notifications')) {
        echo "✅ Notifications table exists\n";
        
        // Get table structure
        $columns = DB::select("DESCRIBE notifications");
        
        echo "\nTable structure:\n";
        foreach ($columns as $column) {
            echo "- {$column->Field}: {$column->Type}\n";
        }
        
        // Check specifically the type column
        $typeColumn = collect($columns)->firstWhere('Field', 'type');
        if ($typeColumn) {
            echo "\n🔍 Type column details:\n";
            echo "Type: {$typeColumn->Type}\n";
            echo "Null: {$typeColumn->Null}\n";
            echo "Default: {$typeColumn->Default}\n";
        }
        
        // Test inserting a notification with ticket_mis_a_jour
        echo "\n=== TESTING NOTIFICATION INSERT ===\n";
        
        try {
            $result = DB::table('notifications')->insert([
                'user_id' => 5,
                'type' => 'ticket_mis_a_jour',
                'titre' => 'Test Schema',
                'message' => 'Testing schema compatibility',
                'date_creation' => now(),
                'lu' => false,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            if ($result) {
                echo "✅ Successfully inserted notification with ticket_mis_a_jour\n";
                
                // Clean up test record
                DB::table('notifications')
                  ->where('titre', 'Test Schema')
                  ->delete();
                echo "🧹 Cleaned up test record\n";
            }
            
        } catch (Exception $e) {
            echo "❌ Failed to insert: " . $e->getMessage() . "\n";
        }
        
    } else {
        echo "❌ Notifications table does not exist\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n=== SCHEMA CHECK COMPLETE ===\n";
