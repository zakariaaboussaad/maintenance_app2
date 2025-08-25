<?php

// Simple test without Laravel bootstrap
echo "=== SIMPLE NOTIFICATION TEST ===\n";

// Test database connection
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=maintenance_db', 'root', '');
    echo "✅ Database connection successful\n";
    
    // Check notifications table structure
    $stmt = $pdo->query("DESCRIBE notifications");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Table columns: " . implode(', ', $columns) . "\n";
    
    // Check if data column exists
    $hasDataColumn = in_array('data', $columns);
    echo "Has 'data' column: " . ($hasDataColumn ? "YES" : "NO") . "\n";
    
    // Get latest notifications
    $stmt = $pdo->query("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5");
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "\nLatest 5 notifications:\n";
    foreach ($notifications as $notif) {
        echo "- ID: {$notif['id']}, Type: {$notif['type']}, User: {$notif['user_id']}, Created: {$notif['created_at']}\n";
        echo "  Title: {$notif['titre']}\n";
        if ($notif['data']) {
            echo "  Data: {$notif['data']}\n";
        }
    }
    
    // Test manual notification creation
    echo "\n=== TESTING MANUAL NOTIFICATION CREATION ===\n";
    
    $stmt = $pdo->prepare("INSERT INTO notifications (user_id, type, titre, message, data, date_creation, lu, priorite, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), 0, 'normale', NOW(), NOW())");
    
    $testData = json_encode([
        'ticket_id' => 11,
        'test' => true,
        'action' => 'manual_test'
    ]);
    
    $result = $stmt->execute([
        5, // user_id (Aicha)
        'ticket_mis_a_jour',
        'Test Status Change Notification',
        'This is a test status change notification',
        $testData
    ]);
    
    if ($result) {
        echo "✅ Manual notification created successfully\n";
        echo "Notification ID: " . $pdo->lastInsertId() . "\n";
    } else {
        echo "❌ Failed to create manual notification\n";
        print_r($stmt->errorInfo());
    }
    
} catch (PDOException $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}

echo "\n=== TEST COMPLETE ===\n";
