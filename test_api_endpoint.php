<?php

require_once 'vendor/autoload.php';

// Load Laravel app
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Test the exact API call that's failing
$testData = [
    'name' => 'Idrissi',
    'email' => 'aicha.idrissi@maintenance.com',
    'default_password' => 'onee2024'
];

echo "Testing forgot password verification API...\n";
echo "Data: " . json_encode($testData, JSON_PRETTY_PRINT) . "\n\n";

// Simulate the API call
$request = new \Illuminate\Http\Request();
$request->merge($testData);

$controller = new \App\Http\Controllers\DefaultPasswordController();

try {
    $response = $controller->verifyForgotPassword($request);
    $responseData = json_decode($response->getContent(), true);
    
    echo "Response Status: " . $response->getStatusCode() . "\n";
    echo "Response Data: " . json_encode($responseData, JSON_PRETTY_PRINT) . "\n";
    
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
