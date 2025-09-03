<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

// Load Laravel app
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    // Set a known default password
    $newDefaultPassword = 'onee2024';
    $hashedPassword = Hash::make($newDefaultPassword);
    
    // Update or insert the default password
    DB::table('system_settings')->updateOrInsert(
        ['key' => 'default_password'],
        [
            'value' => $hashedPassword,
            'description' => 'Default password for password reset verification',
            'updated_at' => now()
        ]
    );
    
    echo "✓ Default password set to: $newDefaultPassword\n";
    echo "✓ Hash: $hashedPassword\n";
    
    // Test the hash
    if (Hash::check($newDefaultPassword, $hashedPassword)) {
        echo "✓ Password verification test passed\n";
    } else {
        echo "✗ Password verification test failed\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
