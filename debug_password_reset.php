<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Password Reset Debug ===" . PHP_EOL;

// Check recent password reset requests
$recentResets = \App\Models\PasswordReset::orderBy('created_at', 'desc')->limit(5)->get();

echo "Recent password reset requests:" . PHP_EOL;
foreach ($recentResets as $reset) {
    echo "- ID: {$reset->id}, Email: {$reset->email}, Status: {$reset->status}, Created: {$reset->created_at}" . PHP_EOL;
}

// Check if we have any approved resets
$approvedResets = \App\Models\PasswordReset::where('status', 'approved')->orderBy('approved_at', 'desc')->limit(3)->get();

echo PHP_EOL . "Recent approved resets:" . PHP_EOL;
foreach ($approvedResets as $reset) {
    echo "- ID: {$reset->id}, Email: {$reset->email}, Approved: {$reset->approved_at}" . PHP_EOL;
    
    // Try to send email for this reset
    $user = \App\Models\User::where('email', $reset->email)->first();
    if ($user) {
        echo "  User found: {$user->nom} {$user->prenom}" . PHP_EOL;
        
        try {
            \Mail::to($user->email)->send(new \App\Mail\PasswordResetApproved(
                $user->nom . ' ' . $user->prenom,
                $reset->new_password ?? 'TestPassword123',
                'Admin Test'
            ));
            echo "  ✅ Email sent successfully!" . PHP_EOL;
        } catch (Exception $e) {
            echo "  ❌ Email failed: " . $e->getMessage() . PHP_EOL;
        }
    } else {
        echo "  ❌ User not found for email: {$reset->email}" . PHP_EOL;
    }
}

echo PHP_EOL . "Mail configuration:" . PHP_EOL;
echo "MAIL_MAILER: " . config('mail.default') . PHP_EOL;
echo "MAIL_FROM: " . config('mail.from.address') . PHP_EOL;
