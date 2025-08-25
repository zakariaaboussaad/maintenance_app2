<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

try {
    $user = User::firstOrCreate(
        ['email' => 'admin@maintenance.com'],
        [
            'nom' => 'Admin',
            'prenom' => 'System', 
            'name' => 'System Admin',
            'matricule' => 'SYS001',
            'password' => Hash::make('123456'),
            'numero_telephone' => '0600000001',
            'poste_affecte' => 'Bureau Principal',
            'role_id' => 1,
            'is_active' => true,
            'date_embauche' => now(),
        ]
    );

    echo "User created/found: " . $user->email . " (ID: " . $user->id_user . ")\n";
    
    // Test token creation
    $token = $user->createToken('test-token');
    echo "Token created successfully: " . substr($token->plainTextToken, 0, 20) . "...\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}
