<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Force Creating Notifications for User 5 ===\n";

// Create status change notification directly
try {
    $statusNotification = \App\Models\Notification::create([
        'user_id' => 5,
        'type' => 'ticket_mis_a_jour',
        'titre' => 'Statut de votre ticket mis à jour',
        'message' => 'Le statut de votre ticket #11 "Ordinateur - Pavilion 15" a été changé de "En cours" à "Fermé" par Alami Fatima.',
        'lu' => false,
        'date_creation' => now(),
        'priorite' => 'normale',
        'data' => json_encode([
            'ticket_id' => 11,
            'old_status' => 'en_cours',
            'new_status' => 'ferme',
            'updated_by' => 3
        ])
    ]);
    echo "✅ Status notification created: ID {$statusNotification->id}\n";
} catch (Exception $e) {
    echo "❌ Status notification failed: " . $e->getMessage() . "\n";
}

// Create comment notification directly
try {
    $commentNotification = \App\Models\Notification::create([
        'user_id' => 5,
        'type' => 'commentaire_ajoute',
        'titre' => 'Nouveau commentaire sur votre ticket',
        'message' => 'Alami Fatima a ajouté un commentaire sur votre ticket #11: Ordinateur - Pavilion 15',
        'lu' => false,
        'date_creation' => now(),
        'priorite' => 'normale',
        'data' => json_encode([
            'ticket_id' => 11,
            'comment_author_id' => 3,
            'comment_author_name' => 'Alami Fatima',
            'ticket_title' => 'Ordinateur - Pavilion 15'
        ])
    ]);
    echo "✅ Comment notification created: ID {$commentNotification->id}\n";
} catch (Exception $e) {
    echo "❌ Comment notification failed: " . $e->getMessage() . "\n";
}

// Check total notifications for user 5
$count = \App\Models\Notification::where('user_id', 5)->count();
echo "\nTotal notifications for user 5: {$count}\n";

// Show recent notifications
$recent = \App\Models\Notification::where('user_id', 5)
    ->orderBy('date_creation', 'desc')
    ->limit(5)
    ->get();

echo "\nRecent notifications:\n";
foreach ($recent as $n) {
    echo "- ID: {$n->id}, Type: {$n->type}, Title: {$n->titre}\n";
}

echo "\n=== Test Complete ===\n";
