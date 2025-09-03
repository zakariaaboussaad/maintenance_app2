<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

// Load Laravel app
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    // Check if default password exists
    $defaultPassword = DB::table('system_settings')->where('key', 'default_password')->first();
    
    if (!$defaultPassword) {
        echo "No default password found. Creating one...\n";
        
        // Create a default password
        $password = 'onee2024';
        $hashedPassword = Hash::make($password);
        
        DB::table('system_settings')->insert([
            'key' => 'default_password',
            'value' => $hashedPassword,
            'description' => 'Default password for password reset verification',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        
        echo "Default password created: $password\n";
        echo "Hashed value: $hashedPassword\n";
    } else {
        echo "Default password already exists:\n";
        echo "Key: " . $defaultPassword->key . "\n";
        echo "Value: " . $defaultPassword->value . "\n";
        echo "Description: " . ($defaultPassword->description ?? 'N/A') . "\n";
    }
    
    // Also check if system_settings table exists
    $tables = DB::select("SHOW TABLES LIKE 'system_settings'");
    if (empty($tables)) {
        echo "ERROR: system_settings table does not exist!\n";
    } else {
        echo "system_settings table exists.\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
