<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update the ENUM to include password notification types
        DB::statement("ALTER TABLE notifications MODIFY COLUMN type ENUM(
            'ticket_nouveau',
            'ticket_assigne', 
            'ticket_mis_a_jour',
            'ticket_ferme',
            'commentaire_ajoute',
            'panne_signale',
            'panne_resolue',
            'intervention_planifiee',
            'password_request',
            'password_changed',
            'password_rejected',
            'system'
        ) NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to original ENUM without password types
        DB::statement("ALTER TABLE notifications MODIFY COLUMN type ENUM(
            'ticket_nouveau',
            'ticket_assigne', 
            'ticket_mis_a_jour',
            'ticket_ferme',
            'commentaire_ajoute',
            'panne_signale',
            'panne_resolue',
            'intervention_planifiee',
            'system'
        ) NOT NULL");
    }
};
