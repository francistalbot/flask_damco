<?php

use App\Http\Controllers\DamcoController;
use App\Http\Controllers\BabacController;
use Illuminate\Support\Facades\Route;
Route::get('/damco-search', [DamcoController::class, 'DamcoSearch']);
Route::get('/babac-search', [BabacController::class, 'BabacSearch']);
Route::get('/translations/{lang}', function ($lang) {
    $path = resource_path("../lang/{$lang}.php");

    if (!file_exists($path)) {
        abort(404, 'Language file not found.');
    }

    return response()->json(require $path);
});
Route::view('/{any?}', 'app')
    ->where('any', '.*');
/*Route::get('/', function () {
    return view('welcome');
});*/
