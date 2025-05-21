<?php

use App\Http\Controllers\Auth\AdminController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\ProfileController;
use App\Http\Controllers\Auth\RegisteredUserController;
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


Route::post('/realClickExperiments', [ClickhouseRealDatabaseController::class, 'getExperiments']);
Route::post('/realClickStocks', [ClickhouseRealDatabaseController::class, 'getStocks']);
Route::post('/realClickModels', [ClickhouseRealDatabaseController::class, 'getModels']);
Route::post('/realClickAdviceLimits', [ClickhouseRealDatabaseController::class, 'getAdviceLimits']);
Route::post('/realClickAdviceLimitsMax', [ClickhouseRealDatabaseController::class, 'getAdviceLimitsMax']);
Route::post('/realClickStoplosses', [ClickhouseRealDatabaseController::class, 'getStoplosses']);
Route::post('/realClickSimulationData', [ClickhouseRealDatabaseController::class, 'getSimulationData']);
Route::post('/realClickStockPrices', [ClickhouseRealDatabaseController::class, 'getStockPrices']);




Route::middleware('auth:sanctum')->group(function () {
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


Route::prefix('auth')->group(function () {
    Route::post('/register', [RegisteredUserController::class, 'store'])
        ->middleware('guest')
        ->name('register');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])
        ->middleware('guest')
        ->name('login');
    Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])
        ->middleware('guest');
    Route::post('/reset-password', [NewPasswordController::class, 'store'])
        ->middleware('guest');

    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
        ->middleware('auth:sanctum')
        ->name('logout');


});
