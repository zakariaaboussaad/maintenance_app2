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
        Schema::create('interventions', function (Blueprint $table) {
            $table->id();
            $table->text('description');
            $table->datetime('date_debut');
            $table->datetime('date_fin')->nullable();
            $table->integer('duree_minutes')->nullable(); // Duration in minutes
            $table->enum('type_intervention', [
                'maintenance_preventive',
                'maintenance_corrective',
                'reparation',
                'installation',
                'mise_a_jour',
                'diagnostic'
            ]);

            // Foreign keys
            $table->unsignedBigInteger('ticket_id')->nullable();
            $table->unsignedBigInteger('panne_id')->nullable();
            $table->unsignedBigInteger('technicien_id');
            $table->unsignedBigInteger('categorie_id')->nullable();

            $table->text('travaux_effectues')->nullable();
            $table->text('pieces_utilisees')->nullable(); // JSON or text
            $table->decimal('cout_pieces', 10, 2)->nullable();
            $table->decimal('cout_main_oeuvre', 10, 2)->nullable();
            $table->enum('resultat', ['succes', 'echec', 'partiel'])->default('succes');
            $table->text('commentaires')->nullable();

            $table->timestamps();

            // Foreign key constraints
            $table->foreign('ticket_id')->references('id')->on('tickets')->onDelete('cascade');
            $table->foreign('panne_id')->references('id')->on('pannes')->onDelete('cascade');
            $table->foreign('technicien_id')->references('id_user')->on('users')->onDelete('cascade');
            $table->foreign('categorie_id')->references('id')->on('categories')->onDelete('set null');

            // Indexes
            $table->index(['ticket_id']);
            $table->index(['panne_id']);
            $table->index(['technicien_id']);
            $table->index(['date_debut']);
            $table->index(['type_intervention']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interventions');
    }
};
