<?php

use App\Http\Controllers\DataController;
use Illuminate\Support\Facades\Route;

Route::get('/mainFolders', [DataController::class, 'getMainFolders']);
Route::get('/folders', [DataController::class, 'getFolders']);
Route::get('/models', [DataController::class, 'getUniqueModels']);
Route::get('/stoploss', [DataController::class, 'getUniqueStopLossValues']);
Route::post('/combinedCsv', [DataController::class, 'getCombinedCsvData']);

