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
        Schema::create('historiques', function (Blueprint $table) {
            $table->id();
            $table->string('action'); // "created", "updated", "deleted", "assigned", etc.
            $table->string('table_name'); // Which table was affected
            $table->string('record_id'); // ID of the affected record
            $table->json('old_values')->nullable(); // Previous values
            $table->json('new_values')->nullable(); // New values
            $table->text('description')->nullable(); // Human readable description

            // Foreign keys
            $table->unsignedBigInteger('user_id'); // Who performed the action
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();

            $table->datetime('date_action')->default(now());
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('user_id')->references('id_user')->on('users')->onDelete('cascade');

            // Indexes
            $table->index(['table_name', 'record_id']);
            $table->index(['user_id']);
            $table->index(['action']);
            $table->index(['date_action']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('historiques');
    }
};
