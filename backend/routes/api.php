<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\BoardController; // Import the BoardController
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TeamManagementController;


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

Route::get('/team/{team_id}/management', [TeamManagementController::class, 'show'])->middleware('api');
Route::post('/team/{team_id}/management', [TeamManagementController::class, 'storeTeamMember'])->middleware('api');
Route::delete('/team/{team_id}/management/{user_id}', [TeamManagementController::class, 'destroyTeamMember'])->middleware('api');


Route::get('/boards/{board_id}', [BoardController::class, 'show'])->middleware('api');
Route::post('/boards/{board_id}', [BoardController::class, 'columnStore'])->middleware('api');
Route::put('/boards/column/{column}', [BoardController::class, 'columnUpdate'])->middleware('api');
Route::post('/boards/{board}/columns/positions', [BoardController::class, 'columnPositionUpdate'])->middleware('api');
Route::delete('/boards/{board_id}/columns/{column_id}', [BoardController::class, 'columnDestroy'])->middleware('api');

Route::post('/boards/{board_id}/task', [BoardController::class, 'taskStore'])->middleware('api');
Route::put('/boards/{board_id}/tasks/{task_id}', [BoardController::class, 'taskUpdate'])->middleware('api');
Route::delete('/boards/{board_id}/tasks/{task_id}', [BoardController::class, 'taskDestroy'])->middleware('api');