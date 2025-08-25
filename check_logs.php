<?php

// Simple script to check if logging is working
echo "=== Testing Laravel Logging ===\n";

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Test basic logging
\Log::info('TEST LOG MESSAGE - PHP script working');
echo "✅ Log message sent\n";

// Check if log file exists
$logPath = storage_path('logs/laravel.log');
echo "Log file path: $logPath\n";

if (file_exists($logPath)) {
    echo "✅ Log file exists\n";
    $size = filesize($logPath);
    echo "Log file size: $size bytes\n";
    
    // Read last few lines
    $lines = file($logPath);
    $lastLines = array_slice($lines, -10);
    echo "\nLast 10 log entries:\n";
    foreach ($lastLines as $line) {
        echo $line;
    }
} else {
    echo "❌ Log file does not exist\n";
}

// Test notification creation directly
echo "\n=== Testing Direct Notification Creation ===\n";
try {
    $notification = \App\Models\Notification::create([
        'user_id' => 5,
        'type' => 'ticket_mis_a_jour',
        'titre' => 'Test Notification',
        'message' => 'This is a test notification',
        'lu' => false,
        'date_creation' => now(),
        'priorite' => 'normale',
        'data' => json_encode(['test' => true])
    ]);
    
    echo "✅ Direct notification created with ID: {$notification->id}\n";
} catch (Exception $e) {
    echo "❌ Direct notification creation failed: " . $e->getMessage() . "\n";
}

echo "\n=== Test Complete ===\n";
