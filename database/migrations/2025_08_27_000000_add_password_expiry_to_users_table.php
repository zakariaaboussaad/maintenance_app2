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
            $table->timestamp('password_updated_at')->nullable()->after('password');
            $table->boolean('password_expired')->default(false)->after('password_updated_at');
            $table->timestamp('password_expiry_notified_at')->nullable()->after('password_expired');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['password_updated_at', 'password_expired', 'password_expiry_notified_at']);
        });
    }
};
