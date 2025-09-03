<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

// Load Laravel app
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    // Get the hashed default password from database
    $defaultPassword = DB::table('system_settings')->where('key', 'default_password')->first();
    
    if (!$defaultPassword) {
        echo "No default password found in database\n";
        exit(1);
    }
    
    echo "Testing common default passwords against the hash...\n\n";
    
    $commonPasswords = [
        'onee2024',
        'ONEE2024', 
        'onee123',
        'maintenance',
        'admin123',
        '123456',
        'password',
        'default',
        'onee',
        'ONEE'
    ];
    
    foreach ($commonPasswords as $password) {
        if (Hash::check($password, $defaultPassword->value)) {
            echo "✓ FOUND: Default password is '$password'\n";
            exit(0);
        } else {
            echo "✗ '$password' - No match\n";
        }
    }
    
    echo "\nNo common passwords matched. The default password might be custom.\n";
    echo "Hash in database: " . $defaultPassword->value . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
