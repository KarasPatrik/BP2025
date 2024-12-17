<?php

use App\Http\Controllers\DataController;
use Illuminate\Support\Facades\Route;

Route::post('/experiments', [DataController::class, 'getExperiments']);
Route::post('/stocks', [DataController::class, 'getStocks']);
Route::post('/models', [DataController::class, 'getUniqueModels']);
Route::post('/stoplosses', [DataController::class, 'getUniqueStopLosses']);
Route::post('/data', [DataController::class, 'getCombinedCsvData']);
Route::post('/stockPrices', [DataController::class, 'getFolderPriceData']);
