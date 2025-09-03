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
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('must_change_password')->default(false);
            $table->timestamp('password_updated_at')->nullable();
            $table->timestamp('password_expiry_notified_at')->nullable();
            $table->integer('password_expiry_days_remaining')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'must_change_password',
                'password_updated_at',
                'password_expiry_notified_at',
                'password_expiry_days_remaining'
            ]);
        });
    }
};
