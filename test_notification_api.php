<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    echo "=== TESTING NOTIFICATION API ===\n";
    
    // Test for user ID 5 (who has notifications in the database)
    $userId = 5;
    echo "Testing notifications for user ID: $userId\n";
    
    // Check if user exists
    $user = App\Models\User::find($userId);
    if (!$user) {
        echo "❌ User not found\n";
        exit;
    }
    echo "✅ User found: " . $user->nom . " " . $user->prenom . "\n";
    
    // Get notifications directly from database
    $notifications = App\Models\Notification::where('user_id', $userId)
        ->orderBy('date_creation', 'desc')
        ->limit(10)
        ->get();
    
    echo "\n=== NOTIFICATIONS FROM DATABASE ===\n";
    echo "Total notifications for user $userId: " . $notifications->count() . "\n";
    
    foreach ($notifications as $notification) {
        $status = $notification->lu ? '✅ Read' : '🔔 Unread';
        echo "- ID: {$notification->id} | Type: {$notification->type} | $status\n";
        echo "  Title: {$notification->titre}\n";
        echo "  Date: {$notification->date_creation}\n\n";
    }
    
    // Test the API controller method directly
    echo "=== TESTING API CONTROLLER ===\n";
    $request = new Illuminate\Http\Request();
    $request->merge(['user_id' => $userId]);
    
    $controller = new App\Http\Controllers\Api\NotificationController();
    $response = $controller->index($request);
    
    $responseData = json_decode($response->getContent(), true);
    echo "API Response Status: " . $response->getStatusCode() . "\n";
    echo "API Response Success: " . ($responseData['success'] ? 'Yes' : 'No') . "\n";
    
    if (isset($responseData['data'])) {
        echo "API Returned Notifications: " . count($responseData['data']) . "\n";
    } else {
        echo "❌ No data in API response\n";
        echo "Response content: " . $response->getContent() . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
