<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/
Route::get('/test-db', function () {
    try {
        $users = DB::select('SELECT * FROM users LIMIT 1');
        return response()->json([
            'status' => 'success', 
            'message' => 'Database connected',
            'user_count' => count($users),
            'sample_user' => $users[0] ?? null
        ]);
    } catch (Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
});
// Main application routes
Route::get('/', function () {
    return view('dashboard');
});

Route::get('/dashboard', function () {
    return view('dashboard');
})->name('dashboard');

Route::get('/app', function () {
    return view('app');
})->name('app');

// Debug routes (optional - remove in production)
Route::get('/debug-routes', function () {
    $routes = collect(Route::getRoutes())->map(function($route) {
        return [
            'method' => implode('|', $route->methods()),
            'uri' => $route->uri(),
            'name' => $route->getName(),
        ];
    });
    return response()->json($routes->toArray());
});
