<?php
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

$password = 'onee2024';
$hash = Hash::make($password);

DB::table('system_settings')->updateOrInsert(
    ['key' => 'default_password'],
    ['value' => $hash, 'updated_at' => now()]
);

echo "Default password updated to: $password\n";
echo "Test it in the form now.\n";
