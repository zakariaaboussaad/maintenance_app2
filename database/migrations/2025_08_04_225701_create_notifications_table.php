<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id('id_notification');
            $table->string('titre');
            $table->text('message');
            $table->enum('type', [
                'ticket_nouveau',
                'ticket_assigne',
                'ticket_mis_a_jour',
                'ticket_ferme',
                'commentaire_ajoute',
                'panne_signale',
                'panne_resolue',
                'intervention_planifiee',
                'system'
            ]);

            // Foreign keys
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('ticket_id')->nullable();
            $table->unsignedBigInteger('panne_id')->nullable();
            $table->string('equipement_id')->nullable();

            $table->boolean('lu')->default(false);
            $table->datetime('date_creation')->default(now());
            $table->datetime('date_lecture')->nullable();
            $table->enum('priorite', ['basse', 'normale', 'haute'])->default('normale');

            $table->timestamps();

            // Foreign key constraints
            $table->foreign('user_id')->references('id_user')->on('users')->onDelete('cascade');
            $table->foreign('ticket_id')->references('id')->on('tickets')->onDelete('cascade');
            $table->foreign('panne_id')->references('id')->on('pannes')->onDelete('cascade');
            $table->foreign('equipement_id')->references('numero_serie')->on('equipements')->onDelete('cascade');

            // Indexes
            $table->index(['user_id']);
            $table->index(['lu']);
            $table->index(['type']);
            $table->index(['date_creation']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
