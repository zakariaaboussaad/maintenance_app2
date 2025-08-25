<?php

// Fix password hashes for Laravel authentication

try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=maintenance_db;charset=utf8mb4', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Connected to MySQL maintenance_db successfully!\n";
    
    // Generate proper Laravel password hash for 'password123'
    $password = 'password123';
    $hash = password_hash($password, PASSWORD_DEFAULT);
    
    echo "Generated hash for 'password123': $hash\n\n";
    
    // Update all users with the correct hash
    $emails = [
        'admin@maintenance.com',
        'ahmed.benali@maintenance.com', 
        'fatima.alami@maintenance.com',
        'mohamed.mansouri@maintenance.com',
        'aicha.idrissi@maintenance.com'
    ];
    
    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE email = ?");
    
    foreach ($emails as $email) {
        $stmt->execute([$hash, $email]);
        echo "Updated password for: $email\n";
    }
    
    echo "\n✅ All passwords updated successfully!\n";
    echo "You can now login with:\n";
    echo "- Any email above\n";
    echo "- Password: password123\n\n";
    
    // Verify the updates
    $stmt = $pdo->query("SELECT email, LEFT(password, 30) as password_start FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Verification:\n";
    foreach ($users as $user) {
        echo "- {$user['email']}: {$user['password_start']}...\n";
    }
    
} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage() . "\n";
}

?>
