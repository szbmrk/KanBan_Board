<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TeamController;

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

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/user/signup', [UserController::class, 'signup']);
Route::post('/user/login', [UserController::class, 'login']);
Route::get('/user/check-login', [UserController::class, 'checkLogin']);
Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('api');
Route::post('/dashboard/board', [DashboardController::class, 'store'])->middleware('api');
Route::put('/dashboard/board/{board}', [DashboardController::class, 'update'])->middleware('api');
Route::delete('/dashboard/board/{board}', [DashboardController::class, 'destroy'])->middleware('api');
Route::get('/dashboard/teams', [TeamController::class, 'index'])->middleware('api');
Route::post('/dashboard/teams', [TeamController::class, 'store'])->middleware('api');
Route::put('/dashboard/teams/{id}', [TeamController::class, 'update'])->middleware('api');
Route::delete('/dashboard/teams/{id}', [TeamController::class, 'destroy'])->middleware('api');