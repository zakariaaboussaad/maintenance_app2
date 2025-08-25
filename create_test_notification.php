<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Notification;
use App\Models\User;

// Create test notifications for user 4 (unread)
$user4 = User::find(4);
if ($user4) {
    Notification::create([
        'user_id' => 4,
        'titre' => 'Test Individual Mark as Read',
        'message' => 'Click this notification to test mark as read functionality',
        'type' => 'system',
        'lu' => false,
        'date_creation' => now(),
        'date_lecture' => null
    ]);
    echo 'Created test notification for user 4' . PHP_EOL;
} else {
    echo 'User 4 not found' . PHP_EOL;
}
