<?php
use App\Models\Feedback;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AGIController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BoardController;
use App\Http\Controllers\ColumnController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\MentionController;
use App\Http\Controllers\TaskTagController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\PriorityController;

use App\Http\Controllers\BoardsController;

use App\Http\Controllers\UserTasksController;
use App\Http\Controllers\AttachmentController;
use App\Http\Controllers\AgiBehaviorController;
use App\Http\Controllers\PromptCraftController;
use App\Http\Controllers\TeamMemberRoleController;

use App\Http\Controllers\NotificationController;
use App\Http\Controllers\TeamManagementController;
use App\Http\Controllers\ChatGPTController;
use App\Http\Controllers\AGIAnswersController;
use App\Http\Controllers\FavouriteTaskController;
use App\Http\Controllers\FavouriteBoardsController;
use App\Http\Controllers\ChangeIsDoneTaskController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\LogController;
use App\Http\Controllers\DashboardController;

use Illuminate\Support\Facades\Password;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use App\Models\User;

/*

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
// Email verification routes
Route::middleware(['auth:sanctum'])->get('/email/verify', function (Request $request) {
    return $request->user()->hasVerifiedEmail()
        ? response()->json(['message' => 'Email already verified.'])
        : response()->json(['message' => 'Email verification required.']);
})->name('verification.notice');

Route::middleware('signed')->get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill();

    return response()->json(['message' => 'Email verified successfully.']);
})->name('verification.verify');

Route::middleware(['auth:sanctum', 'throttle:6,1'])->post('/email/resend', function (Request $request) {
    if ($request->user()->hasVerifiedEmail()) {
        return response()->json(['message' => 'Email already verified.']);
    }

    $request->user()->sendEmailVerificationNotification();

    return response()->json(['message' => 'Verification email sent.']);
})->name('verification.send');

// Routes that require email verification
Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/protected-route', function () {
        return response()->json(['message' => 'You have access to this route because your email is verified.']);
    });
});

Route::get('/user/permissions', [UserController::class, 'showPermissions'])->middleware('api');
Route::post('/user/signup', [UserController::class, 'signup']);
Route::post('/user/login', [UserController::class, 'login']);
Route::get('/user/check-login', [UserController::class, 'checkLogin']);
Route::get('/profile', [UserController::class, 'show'])->middleware('api');
Route::put('/profile', [UserController::class, 'update'])->middleware('api');
Route::delete('/profile', [UserController::class, 'destroy'])->middleware('api');
/* Test email & username */
Route::post('/user/check-email', [UserController::class, 'checkEmail']);
Route::post('/user/check-username', [UserController::class, 'checkUsername']);
Route::post('/password/email', [UserController::class, 'sendResetLinkEmail'])->name('password.email');
Route::post('/password/reset', [UserController::class, 'resetPassword'])->name('password.update');
Route::get('/reset-password/{token}', function ($token) {
    return view('auth.reset-password', ['token' => $token]); })->name('password.reset');
Route::get('/api/email/verify/{id}/{hash}', function (Request $request, $id, $hash) {
    $user = User::findOrFail($id);

    // Verify the signature
    if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
        return response()->json(['error' => 'Invalid verification link'], 403);
    }

    if ($user->hasVerifiedEmail()) {
        return response()->json(['message' => 'Email already verified']);
    }

    $user->markEmailAsVerified();

    return response()->json(['message' => 'Email verified successfully']);
})->middleware(['signed'])->name('verification.verify');


Route::get('/boards', [BoardsController::class, 'index'])->middleware('api');
Route::get('/boards/boards', [BoardsController::class, 'getAllBoards'])->middleware('api');
Route::post('/boards/board', [BoardsController::class, 'store'])->middleware('api');
Route::put('/boards/board/{board}', [BoardsController::class, 'update'])->middleware('api');
Route::delete('/boards/board/{board}', [BoardsController::class, 'destroy'])->middleware('api');

Route::get('/boards/teams', [TeamController::class, 'index'])->middleware('api');
Route::post('/boards/teams', [TeamController::class, 'store'])->middleware('api');
Route::put('/boards/teams/{id}', [TeamController::class, 'update'])->middleware('api');
Route::delete('/boards/teams/{id}', [TeamController::class, 'destroy'])->middleware('api');

Route::get('/team/{team_id}/management', [TeamManagementController::class, 'show'])->middleware('api');
Route::post('/team/{team_id}/management', [TeamManagementController::class, 'storeTeamMember'])->middleware('api');
Route::delete('/team/{team_id}/management/{user_id}', [TeamManagementController::class, 'destroyTeamMember'])->middleware('api');
Route::get('/user/{id}/teams', [TeamManagementController::class, 'teamsByUser'])->middleware('api');
Route::get('/teams', [TeamController::class, 'getAllTeams'])->middleware('api');
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
Route::delete('/boards/{board_id}/tasks/{task_id}/attributes', [TaskController::class, 'attributeDelete'])->middleware('api');
Route::post('/columns/{column_id}/tasks/positions', [TaskController::class, 'taskPositionUpdate'])->middleware('api');
Route::delete('/boards/{board_id}/tasks/{task_id}', [TaskController::class, 'taskDestroy'])->middleware('api');
Route::get('/boards/{board_id}/tasks/{task_id}/subtasks', [TaskController::class, 'showSubtasks'])->middleware('api');
Route::post('/boards/{board_id}/tasks/{parent_task_id}/subtasks', [TaskController::class, 'subtaskStore'])->middleware('api');
Route::put('/boards/{board_id}/subtasks/{subtask_id}', [TaskController::class, 'subtaskUpdate'])->middleware('api');
Route::delete('/boards/{board_id}/subtasks/{subtask_id}', [TaskController::class, 'subtaskDestroy'])->middleware('api');
Route::post('/boards/{boardId}/columns/{columnId}/tasks/create-with-subtasks', [TaskController::class, 'createTasksWithSubtasks'])->middleware('api');
Route::put('/boards/{boardId}/columns/{columnId}/tasks/update-with-subtasks', [TaskController::class, 'updateTasksWithSubtasks'])->middleware('api');
Route::post('/boards/{boardId}/columns/{columnId}/tasks/{taskId}/SubtasksToExistingTask', [TaskController::class, 'addSubtasksToExistingTask'])->middleware('api');
Route::put('/boards/{boardId}/columns/{columnId}/tasks/{taskId}/SubtasksToExistingTask', [TaskController::class, 'updateExistingTask'])->middleware('api');
Route::delete('/boards/{boardId}/columns/{columnId}/tasks/{taskId}/SubtasksToExistingTask', [TaskController::class, 'deleteExistingTaskWithItsSubtasks'])->middleware('api');
Route::get('/board/{board_id}/task-completion-rate', [TaskController::class, 'boardTaskCompletionRate'])->middleware('api');

Route::get('/tasks/{task_id}/comments', [CommentController::class, 'index'])->middleware('api');
Route::post('/tasks/{task_id}/comments', [CommentController::class, 'commentStore'])->middleware('api');
Route::delete('/tasks/comments/{comment_id}', [CommentController::class, 'commentDelete'])->middleware('api');

Route::get('/boards/{boardId}/tasks/{taskId}/tags', [TaskTagController::class, 'index'])->middleware('api');
Route::post('/boards/{boardId}/tasks/{taskId}/tags/{tag_id}', [TaskTagController::class, 'store'])->middleware('api');
Route::delete('/boards/{board_id}/tasks/{task_id}/tags/{tag_id}', [TaskTagController::class, 'destroy'])->middleware('api');

Route::get('/tasks/{task_id}/attachments', [AttachmentController::class, 'index'])->middleware('api');
Route::post('/tasks/{task_id}/attachments', [AttachmentController::class, 'store'])->middleware('api');
Route::post('/tasks/{task_id}/attachments/multiple', [AttachmentController::class, 'storeMultiple'])->middleware('api');
Route::put('/attachments/{attachment_id}', [AttachmentController::class, 'update'])->middleware('api');
Route::delete('/attachments/{attachment_id}', [AttachmentController::class, 'destroy'])->middleware('api');

Route::get('/favourite/{user_id}', [FavouriteTaskController::class, 'index'])->middleware('api');
Route::post('/boards/{board_id}/tasks/{task_id}/favourite', [FavouriteTaskController::class, 'store'])->middleware('api');
Route::delete('/boards/{board_id}/tasks/{task_id}/favourite', [FavouriteTaskController::class, 'destroy'])->middleware('api');

Route::get('/favourite/boards/{user_id}', [FavouriteBoardsController::class, 'index'])->middleware('api');
Route::post('/favourite/boards/', [FavouriteBoardsController::class, 'store'])->middleware('api');
Route::delete('/favourite/boards/', [FavouriteBoardsController::class, 'destroy'])->middleware('api');

Route::post('/boards/{board_id}/tasks/{subtask_id}/isDone', [ChangeIsDoneTaskController::class, 'store'])->middleware('api');
Route::delete('/boards/{board_id}/tasks/{subtask_id}/isDone', [ChangeIsDoneTaskController::class, 'destroy'])->middleware('api');

Route::get('boards/{board_id}/logs', [LogController::class, 'index'])->middleware('api');

Route::get('/boards/{boardId}/roles', [RoleController::class, 'index'])->middleware('api');
Route::post('/boards/{boardId}/roles', [RoleController::class, 'store'])->middleware('api');
Route::put('/boards/{boardId}/roles/{roleId}', [RoleController::class, 'update'])->middleware('api');
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
Route::get('/users/{userId}/unreadNotificationCount', [NotificationController::class, 'unreadNotificationCount'])->middleware('api');
Route::post('/notifications/{userId}', [NotificationController::class, 'store'])->middleware('api');
Route::put('/notifications/multiple', [NotificationController::class, 'updateMultiple'])->middleware('api');
Route::put('/notifications/{notificationId}', [NotificationController::class, 'update'])->middleware('api');
Route::delete('/notifications/{notificationId}', [NotificationController::class, 'destroy'])->middleware('api');

Route::get('/user/{user_id}/tasks', [UserTasksController::class, 'index'])->middleware('api');
Route::post('/tasks/{task_id}/members', [UserTasksController::class, 'store'])->middleware('api');
Route::delete('/tasks/{task_id}/members/{user_id}', [UserTasksController::class, 'destroy'])->middleware('api');
Route::get('/boards/{board_id}/tasks/{task_id}/not_assigned_users', [UserTasksController::class, 'getNotAssigned'])->middleware('api');

Route::get('/boards/{boardId}/team-member-roles', [TeamMemberRoleController::class, 'index'])->middleware('api');
Route::post('/boards/{boardId}/team-member-roles', [TeamMemberRoleController::class, 'store'])->middleware('api');
Route::get('/boards/{boardId}/available-team-member-roles/{teamMemberId}', [TeamMemberRoleController::class, 'getAvailableRoles'])->middleware('api');
Route::delete('/boards/{boardId}/team-member-roles/{teamMemberRoleId}', [TeamMemberRoleController::class, 'destroy'])->middleware('api');

Route::get('/boards/{boardId}/role-permissions', [RolePermissionController::class, 'index'])->middleware('api');
Route::post('/boards/{boardId}/roles/{roleId}/permissions', [RolePermissionController::class, 'store'])->middleware('api');
Route::delete('/boards/{boardId}/roles/{roleId}/permissions/{permissionId}', [RolePermissionController::class, 'destroy'])->middleware('api');
Route::get('/all-permissions', [RolePermissionController::class, 'getAllPermissions'])->middleware('api');

Route::get('/priorities', [PriorityController::class, 'index'])->middleware('api');
Route::get('/AGI/GenerateTask', [AGIController::class, 'GenerateTask'])->middleware('api');
Route::get('/AGI/GenerateSubtask', [AGIController::class, 'GenerateSubtask'])->middleware('api');
Route::get('/AGI/GenerateAttachmentLink', [AGIController::class, 'GenerateAttachmentLink'])->middleware('api');
Route::post('/boards/{boardId}/AGI/GenerateCodeReviewOrDocumentation', [AGIController::class, 'GenerateCodeReviewOrDocumentation'])->middleware('api');
Route::get('/boards/{boardId}/tasks/{taskId}/generate_code', [AGIController::class, 'generateCode'])->middleware('api');
Route::get('/boards/{boardId}/tasks/{taskId}/generate_priority', [AGIController::class, 'generatePriority'])->middleware('api');
Route::get('/boards/{boardId}/generate_priority/{columnId}', [AGIController::class, 'generatePrioritiesForColumn'])->middleware('api');
Route::get('/AGI/generate-documentation-task/board/{boardId}/task/{taskId}', [AGIController::class, 'GenerateTaskDocumentationPerTask'])->middleware('api');
Route::get('/AGI/generate-documentation-board/{boardId}', [AGIController::class, 'GenerateTaskDocumentationPerBoard'])->middleware('api');
Route::get('/AGI/generate-documentation-column/board/{boardId}/column/{columnId}', [AGIController::class, 'GenerateTaskDocumentationPerColumn'])->middleware('api');


Route::get('/boards/{boardId}/AGI/crafted-prompts', [PromptCraftController::class, 'getPrompts'])->middleware('api');
Route::post('/boards/{boardId}/AGI/crafted-prompts', [PromptCraftController::class, 'storePrompts'])->middleware('api');
Route::put('/boards/{boardId}/crafted_prompts/{craftedPromptId}', [PromptCraftController::class, 'updatePrompts'])->middleware('api');
Route::delete('/boards/{boardId}/crafted_prompts/{craftedPromptId}', [PromptCraftController::class, 'destroyPrompts'])->middleware('api');
Route::get('/boards/{boardId}/AGI/crafted-prompts/{craftedPromptId}', [PromptCraftController::class, 'usePrompts'])->middleware('api');

Route::get('/AGI/GenerateTask/CraftedPrompt', [ChatGPTController::class, 'GenerateTaskCraftedPrompt'])->middleware('api');
Route::post('/AGI/generate-performance-summary', [AGIController::class, 'generatePerformanceSummary']);
Route::get('/generate-five-day-summary', [ChatGPTController::class, 'generateFiveDaySummary']);

Route::get('/boards/{boardId}/Behaviors', [AgiBehaviorController::class, 'GetBehaviors'])->middleware('api');
Route::post('/boards/{boardId}/Behaviors', [AgiBehaviorController::class, 'StoreBehavior'])->middleware('api');
Route::put('/boards/{boardId}/Behaviors/{behaviorId}', [AgiBehaviorController::class, 'UpdateBehavior'])->middleware('api');
Route::delete('/boards/{boardId}/Behaviors/{behaviorId}', [AgiBehaviorController::class, 'DestroyBehavior'])->middleware('api');

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('api');

Route::get('/AGI/taskDocumentation/boards/{boardId}', [AGIAnswersController::class, 'indexTaskDocumentation'])->middleware('api');
Route::post('/AGI/taskDocumentation/boards/{boardId}', [AGIAnswersController::class, 'storePerBoard'])->middleware('api');
Route::post('/AGI/taskDocumentation/boards/{boardId}/task/{task_id}', [AGIAnswersController::class, 'storePerTask'])->middleware('api');
Route::post('/AGI/taskDocumentation/boards/{boardId}/column/{column_id}', [AGIAnswersController::class, 'storePerColumn'])->middleware('api');
Route::put('/AGI/taskDocumentation/boards/{boardId}/agiAnswer/{agiAnswerId}', [AGIAnswersController::class, 'update'])->middleware('api');
Route::delete('/AGI/boards/{boardId}/taskDocumentation/agiAnswer/{agiAnswerId}', [AGIAnswersController::class, 'destroy'])->middleware('api');
Route::get('/AGI/CodeReviewOrDocumentation/boards/{boardId}', [AGIAnswersController::class, 'indexCodeReviewOrDocumentation'])->middleware('api');
Route::post('/AGI/CodeReviewOrDocumentation/boards/{boardId}', [AGIAnswersController::class, 'storeCodeReviewOrDocumentation'])->middleware('api');
Route::put('/AGI/CodeReviewOrDocumentation/boards/{boardId}/agiAnswer/{agiAnswerId}', [AGIAnswersController::class, 'updateCodeReviewOrDocumentation'])->middleware('api');
Route::delete('/AGI/CodeReviewOrDocumentation/boards/{boardId}/agiAnswer/{agiAnswerId}', [AGIAnswersController::class, 'destroyCodeReviewOrDocumentation'])->middleware('api');
