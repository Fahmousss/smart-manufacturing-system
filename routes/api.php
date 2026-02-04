<?php

use App\Http\Controllers\Api\MachineDataController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Machine Data Collection API
Route::prefix('machines/{machine}')->group(function () {
    Route::post('/production', [MachineDataController::class, 'recordProduction']);
    Route::post('/temperature', [MachineDataController::class, 'recordTemperature']);
    Route::post('/status', [MachineDataController::class, 'updateStatus']);
    Route::post('/operator', [MachineDataController::class, 'updateOperator']);
});
