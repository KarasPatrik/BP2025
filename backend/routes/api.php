<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DataController;

Route::post('/experiments', [DataController::class, 'getExperiments']);
Route::post('/stocks', [DataController::class, 'getStocks']);
Route::post('/models', [DataController::class, 'getUniqueModels']);
Route::post('/stoplosses', [DataController::class, 'getUniqueStopLosses']);
Route::post('/data', [DataController::class, 'getCombinedCsvData']);
Route::post('/stockPrices', [DataController::class, 'getFolderPriceData']);
Route::post('/sampledData', [DataController::class, 'getSampledCsvData']);

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});


