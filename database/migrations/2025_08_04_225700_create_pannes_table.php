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
        Schema::create('pannes', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->text('description');
            $table->datetime('date_panne');
            $table->datetime('date_detection')->nullable();
            $table->enum('severite', ['mineure', 'moyenne', 'majeure', 'critique'])->default('moyenne');
            $table->enum('type_panne', ['hardware', 'software', 'reseau', 'autre'])->default('hardware');

            // Foreign keys
            $table->string('equipement_id');
            $table->unsignedBigInteger('status_panne_id')->default(1);
            $table->unsignedBigInteger('detecte_par')->nullable(); // User who detected it

            $table->text('cause_probable')->nullable();
            $table->text('solution_temporaire')->nullable();
            $table->boolean('panne_recurrente')->default(false);
            $table->decimal('cout_estime', 10, 2)->nullable();

            $table->timestamps();

            // Foreign key constraints
            $table->foreign('equipement_id')->references('numero_serie')->on('equipements')->onDelete('cascade');
            $table->foreign('status_panne_id')->references('id')->on('status_pannes')->onDelete('cascade');
            $table->foreign('detecte_par')->references('id_user')->on('users')->onDelete('set null');

            // Indexes
            $table->index(['equipement_id']);
            $table->index(['status_panne_id']);
            $table->index(['severite']);
            $table->index(['date_panne']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pannes');
    }
};
