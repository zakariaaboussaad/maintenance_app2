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
        Schema::create('equipements', function (Blueprint $table) {
            $table->string('numero_serie')->primary();
            $table->string('modele');
            $table->string('marque')->nullable();
            $table->string('os')->nullable();
            $table->date('date_installation');
            $table->enum('status', ['Actif', 'Inactif', 'En maintenance', 'Hors service', 'En réparation'])->default('Actif');
            $table->string('localisation')->nullable();
            $table->decimal('prix_achat', 10, 2)->nullable();
            $table->date('date_garantie')->nullable();
            $table->foreignId('type_equipement_id')->constrained('type_equipements', 'id_type')->onDelete('cascade');
            $table->foreignId('utilisateur_assigne')->nullable()->constrained('users', 'id_user')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipements');
    }
};
