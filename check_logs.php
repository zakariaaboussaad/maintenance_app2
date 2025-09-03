<?php

// Simple script to check if logging is working
echo "=== Testing Laravel Logging ===\n";

require_once 'vendor/autoload.php';

// Load Laravel app
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Checking Password Reset Emails for aboussaadzakaria7@gmail.com ===" . PHP_EOL;

$logFile = 'storage/logs/laravel.log';
if (file_exists($logFile)) {
    $logContent = file_get_contents($logFile);
    
    // Search for your specific email
    if (strpos($logContent, 'aboussaadzakaria7@gmail.com') !== false) {
        echo "✅ Found entries for aboussaadzakaria7@gmail.com in logs!" . PHP_EOL;
        
        // Extract email content
        $lines = explode("\n", $logContent);
        $emailLines = [];
        
        foreach ($lines as $line) {
            if (stripos($line, 'aboussaadzakaria7@gmail.com') !== false ||
                stripos($line, 'password reset') !== false ||
                stripos($line, 'TempPassword') !== false ||
                stripos($line, 'PasswordResetApproved') !== false) {
                $emailLines[] = $line;
            }
        }
        
        echo "Recent email entries:" . PHP_EOL;
        foreach (array_slice($emailLines, -5) as $line) {
            echo $line . PHP_EOL;
        }
        
        // Look for the actual email content in logs
        if (strpos($logContent, 'Message-ID:') !== false) {
            echo PHP_EOL . "📧 Email content found in logs (showing last email):" . PHP_EOL;
            $emailStart = strrpos($logContent, 'Message-ID:');
            if ($emailStart !== false) {
                $emailContent = substr($logContent, $emailStart, 2000);
                echo substr($emailContent, 0, 1000) . "..." . PHP_EOL;
            }
        }
        
    } else {
        echo "❌ No entries found for aboussaadzakaria7@gmail.com" . PHP_EOL;
    }
} else {
    echo "❌ Log file not found: $logFile" . PHP_EOL;
}

echo PHP_EOL . "Mail configuration:" . PHP_EOL;
echo "MAIL_MAILER: " . config('mail.default') . PHP_EOL;
echo "MAIL_FROM: " . config('mail.from.address') . PHP_EOL;

if (config('mail.default') === 'log') {
    echo PHP_EOL . "⚠️  MAIL_MAILER is set to 'log' - emails are saved to log files, not sent!" . PHP_EOL;
    echo "To send real emails, change MAIL_MAILER to 'smtp' in .env file" . PHP_EOL;
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
