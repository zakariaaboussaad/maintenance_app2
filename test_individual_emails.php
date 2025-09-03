<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Testing Individual User Email Delivery ===" . PHP_EOL;

// Get all users to test with
$users = \App\Models\User::limit(5)->get();

echo "Found " . $users->count() . " users:" . PHP_EOL;
foreach ($users as $user) {
    echo "- {$user->nom} {$user->prenom} ({$user->email})" . PHP_EOL;
}

echo PHP_EOL . "=== Simulating Password Reset for Each User ===" . PHP_EOL;

foreach ($users as $user) {
    echo "Testing email for: {$user->nom} {$user->prenom} ({$user->email})" . PHP_EOL;
    
    try {
        // This is exactly what the NotificationService does
        \Mail::to($user->email)->send(new \App\Mail\PasswordResetApproved(
            $user->nom . ' ' . $user->prenom,
            'TempPassword' . rand(100, 999),
            'Admin Test'
        ));
        
        echo "  ✅ Email sent to: {$user->email}" . PHP_EOL;
        
    } catch (Exception $e) {
        echo "  ❌ Failed to send to {$user->email}: " . $e->getMessage() . PHP_EOL;
    }
}

echo PHP_EOL . "=== Email Configuration ===" . PHP_EOL;
echo "MAIL_MAILER: " . config('mail.default') . PHP_EOL;
echo "MAIL_FROM: " . config('mail.from.address') . PHP_EOL;

if (config('mail.default') === 'log') {
    echo PHP_EOL . "📝 Since MAIL_MAILER=log, emails are saved to storage/logs/laravel.log" . PHP_EOL;
    echo "Each user gets their own email with their specific email address." . PHP_EOL;
}
