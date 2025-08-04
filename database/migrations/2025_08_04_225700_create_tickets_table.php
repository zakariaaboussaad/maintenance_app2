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
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->text('description');
            $table->enum('priorite', ['basse', 'normale', 'haute', 'critique'])->default('normale');
            $table->enum('status', [
                'ouvert',
                'en_cours',
                'en_attente',
                'resolu',
                'ferme',
                'annule'
            ])->default('ouvert');

            // Foreign keys
            $table->unsignedBigInteger('user_id'); // Who created the ticket
            $table->string('equipement_id'); // Which equipment
            $table->unsignedBigInteger('technicien_assigne')->nullable(); // Assigned technician
            $table->unsignedBigInteger('categorie_id')->nullable();

            $table->datetime('date_creation')->default(now());
            $table->datetime('date_assignation')->nullable();
            $table->datetime('date_resolution')->nullable();
            $table->datetime('date_fermeture')->nullable();

            $table->text('commentaire_resolution')->nullable();
            $table->integer('temps_resolution')->nullable(); // in minutes

            $table->timestamps();

            // Foreign key constraints
            $table->foreign('user_id')->references('id_user')->on('users')->onDelete('cascade');
            $table->foreign('equipement_id')->references('numero_serie')->on('equipements')->onDelete('cascade');
            $table->foreign('technicien_assigne')->references('id_user')->on('users')->onDelete('set null');
            $table->foreign('categorie_id')->references('id')->on('categories')->onDelete('set null');

            // Indexes
            $table->index(['status']);
            $table->index(['priorite']);
            $table->index(['user_id']);
            $table->index(['equipement_id']);
            $table->index(['technicien_assigne']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
