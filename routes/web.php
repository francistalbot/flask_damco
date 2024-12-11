<?php

use App\Http\Controllers\DamcoController;
use Illuminate\Support\Facades\Route;
Route::get('/damco-search', [DamcoController::class, 'DamcoSearch']);

Route::view('/{any?}', 'app')
    ->where('any', '.*');
/*Route::get('/', function () {
    return view('welcome');
});*/
