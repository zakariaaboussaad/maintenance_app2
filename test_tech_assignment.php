<?php

// Simple database connection test for technician assignments
$host = '127.0.0.1';
$dbname = 'maintenance_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== TECHNICIAN ASSIGNMENT TEST ===\n";
    
    // Check for technician users (role_id = 3)
    $stmt = $pdo->query("SELECT id_user, nom, prenom, role_id FROM users WHERE role_id = 3 LIMIT 1");
    $technician = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$technician) {
        echo "❌ No technician users found (role_id = 3)\n";
        
        // Check what roles exist
        $stmt = $pdo->query("SELECT DISTINCT role_id FROM users ORDER BY role_id");
        $roles = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo "Available roles: " . implode(', ', $roles) . "\n";
        
        // Use role_id = 2 if available (might be technician)
        if (in_array(2, $roles)) {
            $stmt = $pdo->query("SELECT id_user, nom, prenom, role_id FROM users WHERE role_id = 2 LIMIT 1");
            $technician = $stmt->fetch(PDO::FETCH_ASSOC);
            echo "Using role_id = 2 as technician\n";
        }
    }
    
    if (!$technician) {
        echo "❌ No suitable technician found\n";
        exit;
    }
    
    echo "✅ Found technician: ID {$technician['id_user']}, Name: {$technician['nom']} {$technician['prenom']}\n";
    
    // Test notification creation for technician assignment
    $sql = "INSERT INTO notifications (user_id, type, titre, message, date_creation, lu, created_at, updated_at) 
            VALUES (?, 'ticket_assigne', 'Nouveau ticket assigné', 'Test assignment notification', NOW(), 0, NOW(), NOW())";
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([$technician['id_user']]);
    
    if ($result) {
        echo "✅ Test notification created for technician!\n";
        
        // Get the notification
        $stmt = $pdo->query("SELECT * FROM notifications WHERE user_id = {$technician['id_user']} ORDER BY created_at DESC LIMIT 1");
        $notification = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($notification) {
            echo "Notification ID: {$notification['id']}, Type: {$notification['type']}\n";
            
            // Clean up
            $pdo->exec("DELETE FROM notifications WHERE id = {$notification['id']}");
            echo "🧹 Test notification cleaned up\n";
        }
    } else {
        echo "❌ Failed to create test notification\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n=== TEST COMPLETE ===\n";
