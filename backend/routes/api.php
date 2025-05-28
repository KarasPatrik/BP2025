<?php

use App\Http\Controllers\Auth\AdminController;
use App\Http\Controllers\Auth\ProfileController;
use App\Http\Controllers\ClickhouseController;
use App\Http\Controllers\ClickhouseRealDatabaseController;
use App\Http\Controllers\DataController;
use App\Http\Controllers\FavoriteSimulationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::post('/experiments', [DataController::class, 'getExperiments']);
Route::post('/stocks', [DataController::class, 'getStocks']);
Route::post('/models', [DataController::class, 'getUniqueModels']);
Route::post('/stoplosses', [DataController::class, 'getUniqueStopLosses']);
Route::post('/data', [DataController::class, 'getCombinedCsvData']);
Route::post('/stockPrices', [DataController::class, 'getFolderPriceData']);
Route::post('/sampledData', [DataController::class, 'getSampledCsvData']);


Route::post('/clickExperiments', [ClickhouseController::class, 'getExperiments']);
Route::post('/clickStocks', [ClickhouseController::class, 'getStocks']);
Route::post('/clickModels', [ClickhouseController::class, 'getUniqueModels']);
Route::post('/clickStoplosses', [ClickhouseController::class, 'getUniqueStopLosses']);
Route::post('/clickData', [ClickhouseController::class, 'getCombinedCsvData']);
Route::post('/sampledClickData', [ClickhouseController::class, 'getSampledClickData']);
Route::post('/sampledClickStockPrices', [ClickhouseController::class, 'getSampledClickStockPrices']);






Route::middleware('auth:sanctum')->group(function () {

    Route::post('/realClickExperiments', [ClickhouseRealDatabaseController::class, 'getExperiments']);
    Route::post('/realClickStocks', [ClickhouseRealDatabaseController::class, 'getStocks']);
    Route::post('/realClickModels', [ClickhouseRealDatabaseController::class, 'getModels']);
    Route::post('/realClickAdviceLimits', [ClickhouseRealDatabaseController::class, 'getAdviceLimits']);
    Route::post('/realClickAdviceLimitsMax', [ClickhouseRealDatabaseController::class, 'getAdviceLimitsMax']);
    Route::post('/realClickStoplosses', [ClickhouseRealDatabaseController::class, 'getStoplosses']);
    Route::post('/realClickSimulationData', [ClickhouseRealDatabaseController::class, 'getSimulationData']);
    Route::post('/realClickStockPrices', [ClickhouseRealDatabaseController::class, 'getStockPrices']);

    Route::get('/favorites', [FavoriteSimulationController::class, 'index']);
    Route::post('/favorites', [FavoriteSimulationController::class, 'store']);
    Route::delete('/favorites/{favorite}', [FavoriteSimulationController::class, 'destroy']);
});


Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/user/change-password', [ProfileController::class, 'changePassword']);

    Route::get('/admin/pending-users', [AdminController::class, 'pendingUsers']);
    Route::get('/admin/approved-users', [AdminController::class, 'approvedUsers']);
    Route::post('/admin/approve-user/{id}', [AdminController::class, 'approve']);
    Route::post('/admin/change-user-password/{id}', [AdminController::class, 'changeUserPassword']);
    Route::delete('/admin/delete-user/{id}', [AdminController::class, 'delete']);
});


