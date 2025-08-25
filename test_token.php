<?php

// Simple test script to check token creation
require_once 'vendor/autoload.php';

try {
    $app = require_once 'bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    // Test database connection
    $pdo = DB::connection()->getPdo();
    echo "✅ Database connected\n";
    
    // Find user
    $user = App\Models\User::where('email', 'admin@maintenance.com')->first();
    if (!$user) {
        echo "❌ User not found\n";
        exit(1);
    }
    echo "✅ User found: {$user->email} (ID: {$user->id_user})\n";
    
    // Test token creation
    $token = $user->createToken('test-token');
    echo "✅ Token created: " . substr($token->plainTextToken, 0, 20) . "...\n";
    echo "✅ Token ID: {$token->accessToken->id}\n";
    
    // Test token count
    $tokenCount = DB::table('personal_access_tokens')->count();
    echo "✅ Total tokens in database: {$tokenCount}\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}
