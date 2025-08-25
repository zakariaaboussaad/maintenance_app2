<?php

use Illuminate\Database\Capsule\Manager as DB;

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    DB::connection()->getPdo();
    echo "Successfully connected to the database: " . DB::connection()->getDatabaseName();
} catch (\Exception $e) {
    die("Could not connect to the database. Error: " . $e->getMessage());
}
