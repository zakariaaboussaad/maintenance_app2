<?php

require_once 'vendor/autoload.php';

// Load Laravel app
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Email Configuration Test ===" . PHP_EOL;
echo "MAIL_MAILER: " . config('mail.default') . PHP_EOL;
echo "MAIL_FROM_ADDRESS: " . config('mail.from.address') . PHP_EOL;
echo "MAIL_FROM_NAME: " . config('mail.from.name') . PHP_EOL;
echo PHP_EOL;

try {
    // Test basic email sending
    Mail::raw('This is a test password reset email from the maintenance system.', function($message) {
        $message->to('test@example.com')
                ->subject('Test Password Reset Email');
    });
    
    echo "✅ Test email sent successfully!" . PHP_EOL;
    echo "Check storage/logs/laravel.log for the email content" . PHP_EOL;
    
} catch (Exception $e) {
    echo "❌ Email sending failed: " . $e->getMessage() . PHP_EOL;
}

// Test the actual password reset email
try {
    echo PHP_EOL . "=== Testing Password Reset Email Template ===" . PHP_EOL;
    
    $mail = new \App\Mail\PasswordResetApproved(
        'Test User',
        'TempPassword123',
        'Admin User'
    );
    
    Mail::to('user@example.com')->send($mail);
    
    echo "✅ Password reset email template sent successfully!" . PHP_EOL;
    
} catch (Exception $e) {
    echo "❌ Password reset email failed: " . $e->getMessage() . PHP_EOL;
}
