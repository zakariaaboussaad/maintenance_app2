<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

// Load Laravel app
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    echo "=== Testing Password Reset System ===\n\n";
    
    // 1. Check if system_settings table exists and has default password
    $defaultPassword = DB::table('system_settings')->where('key', 'default_password')->first();
    
    if ($defaultPassword) {
        echo "✓ Default password exists in system_settings\n";
        echo "  Hash: " . substr($defaultPassword->value, 0, 20) . "...\n";
    } else {
        echo "✗ No default password found\n";
        exit(1);
    }
    
    // 2. Check if user exists
    $user = DB::table('users')->where('nom', 'aaa')->where('email', 'zakariaaboussaad81@gmail.com')->first();
    
    if ($user) {
        echo "✓ User found: {$user->nom} ({$user->email})\n";
    } else {
        echo "✗ User not found with name 'aaa' and email 'zakariaaboussaad81@gmail.com'\n";
        
        // Show available users
        $users = DB::table('users')->select('nom', 'email')->get();
        echo "Available users:\n";
        foreach ($users as $u) {
            echo "  - {$u->nom} ({$u->email})\n";
        }
        exit(1);
    }
    
    // 3. Test password verification (simulate what the API does)
    $testPassword = 'onee2024'; // Common default password
    
    if (Hash::check($testPassword, $defaultPassword->value)) {
        echo "✓ Test password 'onee2024' matches default password hash\n";
    } else {
        echo "✗ Test password 'onee2024' does not match\n";
        echo "  Try entering 'onee2024' as the default password\n";
    }
    
    echo "\n=== Test Complete ===\n";
    echo "If the Laravel server is running on port 8000, the password reset should work.\n";
    echo "Use 'onee2024' as the default password in the form.\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
