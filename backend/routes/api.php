<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AGIController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BoardController;
use App\Http\Controllers\ColumnController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\TaskTagController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AttachmentController;
use App\Http\Controllers\TeamManagementController;
use App\Http\Controllers\FavouriteTaskController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\MentionController;
use App\Models\Feedback;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PriorityController;
use App\Http\Controllers\TeamMemberRoleController;

/*
use App\Http\Controllers\UserTasksController;/*
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
Route::get('/dashboard/AGI', [DashboardController::class, 'executeAGIBoard'])->middleware('api');

Route::get('/dashboard/teams', [TeamController::class, 'index'])->middleware('api');
Route::post('/dashboard/teams', [TeamController::class, 'store'])->middleware('api');
Route::put('/dashboard/teams/{id}', [TeamController::class, 'update'])->middleware('api');
Route::delete('/dashboard/teams/{id}', [TeamController::class, 'destroy'])->middleware('api');

Route::get('/team/{team_id}/management', [TeamManagementController::class, 'show'])->middleware('api');
Route::post('/team/{team_id}/management', [TeamManagementController::class, 'storeTeamMember'])->middleware('api');
Route::delete('/team/{team_id}/management/{user_id}', [TeamManagementController::class, 'destroyTeamMember'])->middleware('api');
Route::get('/user/{id}/teams', [TeamManagementController::class, 'teamsByUser'])->middleware('api');
Route::get('/team/{team_id}/management/no_members', [TeamManagementController::class, 'showNotTeamMembers'])->middleware('api');

Route::get('/boards/{board_id}', [BoardController::class, 'show'])->middleware('api');

Route::get('/boards/{boardId}/tags', [TagController::class, 'index'])->middleware('api');
Route::post('/boards/{boardId}/tags', [TagController::class, 'store'])->middleware('api');
Route::put('/boards/{boardId}/tags/{tagId}', [TagController::class, 'update'])->middleware('api');
Route::delete('/boards/{boardId}/tags/{tagId}', [TagController::class, 'destroy'])->middleware('api');

Route::post('/boards/{board_id}', [ColumnController::class, 'columnStore'])->middleware('api');
Route::put('/boards/column/{column}', [ColumnController::class, 'columnUpdate'])->middleware('api');
Route::post('/boards/{board}/columns/positions', [ColumnController::class, 'columnPositionUpdate'])->middleware('api');
Route::delete('/boards/{board_id}/columns/{column_id}', [ColumnController::class, 'columnDestroy'])->middleware('api');

Route::post('/boards/{board_id}/task', [TaskController::class, 'taskStore'])->middleware('api');
Route::put('/boards/{board_id}/tasks/{task_id}', [TaskController::class, 'taskUpdate'])->middleware('api');
Route::post('/columns/{column_id}/tasks/positions', [TaskController::class, 'taskPositionUpdate'])->middleware('api');
Route::delete('/boards/{board_id}/tasks/{task_id}', [TaskController::class, 'taskDestroy'])->middleware('api');
Route::get('/boards/{board_id}/tasks/{task_id}/subtasks', [TaskController::class, 'showSubtasks'])->middleware('api');
Route::post('/boards/{board_id}/tasks/{parent_task_id}/subtasks', [TaskController::class, 'subtaskStore'])->middleware('api');
Route::put('/boards/{board_id}/subtasks/{subtask_id}', [TaskController::class, 'subtaskUpdate'])->middleware('api');
Route::delete('/boards/{board_id}/subtasks/{subtask_id}', [TaskController::class, 'subtaskDestroy'])->middleware('api');

Route::get('/tasks/{task_id}/comments', [CommentController::class, 'index'])->middleware('api');
Route::post('/tasks/{task_id}/comments', [CommentController::class, 'commentStore'])->middleware('api');

Route::get('/boards/{boardId}/tasks/{taskId}/tags', [TaskTagController::class, 'index'])->middleware('api');
Route::post('/boards/{boardId}/tasks/{taskId}/tags/{tag_id}', [TaskTagController::class, 'store'])->middleware('api');
Route::delete('/boards/{board_id}/tasks/{task_id}/tags/{tag_id}', [TaskTagController::class, 'destroy'])->middleware('api');

Route::get('/tasks/{task_id}/attachments', [AttachmentController::class, 'index'])->middleware('api');
Route::post('/tasks/{task_id}/attachments', [AttachmentController::class, 'store'])->middleware('api');
Route::put('/attachments/{attachment_id}', [AttachmentController::class, 'update'])->middleware('api');
Route::delete('/attachments/{attachment_id}', [AttachmentController::class, 'destroy'])->middleware('api');
Route::get('/favourite/{user_id}', [FavouriteTaskController::class, 'index'])->middleware('api');
Route::post('/boards/{board_id}/tasks/{task_id}/favourite', [FavouriteTaskController::class, 'store'])->middleware('api');
Route::delete('/boards/{board_id}/tasks/{task_id}/favourite', [FavouriteTaskController::class, 'destroy'])->middleware('api');

Route::get('/boards/{boardId}/roles', [RoleController::class, 'index'])->middleware('api');
Route::post('/boards/{boardId}/roles', [RoleController::class, 'store'])->middleware('api');
Route::put('/boards/{boardId}/roles/{roleId}',[RoleController::class, 'update'])->middleware('api');
Route::delete('/boards/{boardId}/roles/{roleId}', [RoleController::class, 'destroy'])->middleware('api');

Route::get('/boards/{boardId}/tasks/{taskId}/mentions', [MentionController::class, 'index'])->middleware('api');
Route::post('/boards/{boardId}/tasks/{taskId}/mentions', [MentionController::class, 'store'])->middleware('api');
Route::delete('/boards/{boardId}/tasks/{taskId}/mentions/{mentionId}', [MentionController::class, 'destroy'])->middleware('api');

Route::get('/boards/{boardId}/tasks/{taskId}/feedbacks', [FeedbackController::class, 'index'])->middleware('api');
Route::post('/boards/{boardId}/tasks/{taskId}/feedbacks', [FeedbackController::class, 'store'])->middleware('api');
Route::put('/boards/{boardId}/tasks/{taskId}/feedbacks/{feedbackId}', [FeedbackController::class, 'update'])->middleware('api');
Route::delete('/boards/{boardId}/tasks/{taskId}/feedbacks/{feedbackId}', [FeedbackController::class, 'destroy'])->middleware('api');

Route::get('/users/{userId}/notifications', [NotificationController::class, 'index'])->middleware('api');
Route::get('/users/{userId}/notifications/{notificationId}', [NotificationController::class, 'show'])->middleware('api');
Route::post('/notifications/{userId}', [NotificationController::class, 'store'])->middleware('api');
Route::put('/notifications/{notificationId}', [NotificationController::class, 'update'])->middleware('api');
Route::delete('/notifications/{notificationId}', [NotificationController::class, 'destroy'])->middleware('api');

Route::get('/user/{user_id}/tasks', [UserTasksController::class, 'index'])->middleware('api');

Route::get('/boards/{boardId}/team-member-roles', [TeamMemberRoleController::class, 'index'])->middleware('api');
Route::post('/boards/{boardId}/team-member-roles', [TeamMemberRoleController::class, 'store'])->middleware('api');
Route::delete('/boards/{boardId}/team-member-roles/{teamMemberRoleId}',[TeamMemberRoleController::class, 'destroy'])->middleware('api');

Route::get('/priorities', [PriorityController::class, 'index'])->middleware('api');
Route::get('/boards/{boardId}/tasks/{taskId}/generate_code', [AGIController::class, 'generateCode'])->middleware('api');
Route::get('/boards/{boardId}/tasks/{taskId}/generate_priority', [AGIController::class, 'generatePriority'])->middleware('api');
Route::get('/boards/{boardId}/generate_priority/{columnId}', [AGIController::class, 'generatePrioritiesForColumn'])->middleware('api');
