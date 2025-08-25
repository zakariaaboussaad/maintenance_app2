<?php

// Simple database connection test
$host = '127.0.0.1';
$dbname = 'maintenance_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== DATABASE CONNECTION SUCCESS ===\n";
    
    // Check the type column definition
    $stmt = $pdo->query("SHOW COLUMNS FROM notifications WHERE Field = 'type'");
    $column = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "Type column definition: " . $column['Type'] . "\n";
    
    // Try to insert a test notification
    echo "\n=== TESTING INSERT ===\n";
    
    $sql = "INSERT INTO notifications (user_id, type, titre, message, date_creation, lu, created_at, updated_at) 
            VALUES (5, 'ticket_mis_a_jour', 'Debug Test', 'Testing enum', NOW(), 0, NOW(), NOW())";
    
    try {
        $pdo->exec($sql);
        echo "✅ Insert successful!\n";
        
        // Get the inserted record
        $stmt = $pdo->query("SELECT * FROM notifications WHERE titre = 'Debug Test'");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            echo "✅ Record found: ID {$result['id']}, Type: '{$result['type']}'\n";
            
            // Clean up
            $pdo->exec("DELETE FROM notifications WHERE id = " . $result['id']);
            echo "🧹 Cleaned up test record\n";
        }
        
    } catch (PDOException $e) {
        echo "❌ Insert failed: " . $e->getMessage() . "\n";
        
        // If it's an enum issue, fix it
        if (strpos($e->getMessage(), 'Data truncated') !== false || strpos($e->getMessage(), 'enum') !== false) {
            echo "\n=== FIXING ENUM VALUES ===\n";
            
            $fixSql = "ALTER TABLE notifications MODIFY COLUMN type ENUM(
                'ticket_nouveau',
                'ticket_assigne', 
                'ticket_mis_a_jour',
                'ticket_ferme',
                'commentaire_ajoute',
                'panne_signale',
                'panne_resolue', 
                'intervention_planifiee',
                'system'
            )";
            
            try {
                $pdo->exec($fixSql);
                echo "✅ ENUM fixed!\n";
                
                // Try insert again
                $pdo->exec($sql);
                echo "✅ Insert successful after fix!\n";
                
                // Clean up
                $stmt = $pdo->query("SELECT id FROM notifications WHERE titre = 'Debug Test'");
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($result) {
                    $pdo->exec("DELETE FROM notifications WHERE id = " . $result['id']);
                    echo "🧹 Cleaned up test record\n";
                }
                
            } catch (PDOException $fixError) {
                echo "❌ Failed to fix ENUM: " . $fixError->getMessage() . "\n";
            }
        }
    }
    
} catch (PDOException $e) {
    echo "❌ Connection failed: " . $e->getMessage() . "\n";
}

echo "\n=== DEBUG COMPLETE ===\n";
