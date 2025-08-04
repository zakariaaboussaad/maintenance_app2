<?php
use Illuminate\Support\Facades\Route;

Route::get('/debug-routes', function () {
    $routes = collect(Route::getRoutes())->map(function($route) {
        return [
            'method' => implode('|', $route->methods()),
            'uri' => $route->uri(),
            'name' => $route->getName(),
            'middleware' => $route->middleware(),
            'action' => $route->getActionName()
        ];
    });

    return response()->json($routes->toArray());
});

Route::get('/test-route', function () {
    return 'This works without auth!';
});

Route::get('/', function () {
    return view('app');
});
