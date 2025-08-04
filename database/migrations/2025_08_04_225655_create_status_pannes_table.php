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
        Schema::create('status_pannes', function (Blueprint $table) {
            $table->id();
            $table->string('nom'); // "Nouvelle", "En cours", "Résolue", "Fermée"
            $table->text('description')->nullable();
            $table->string('couleur')->nullable(); // For UI display
            $table->integer('ordre')->default(0); // For ordering in UI
            $table->boolean('is_final')->default(false); // If this status means the panne is closed
            $table->timestamps();

            $table->index(['nom']);
            $table->index(['ordre']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('status_pannes');
    }
};
