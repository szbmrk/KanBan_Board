<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\Task;
use App\Models\Team;
use App\Models\Board;
use App\Models\Column;
use App\Models\Comment;
use App\Models\Mention;
use App\Models\Tag;
use App\Models\TaskTag;
use App\Models\Feedback;
use App\Models\UserTask;
use App\Models\Attachment;
use Illuminate\Http\Request;
use App\Models\FavouriteTask;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;
use App\Models\Priority;
use Illuminate\Support\Facades\DB;
use App\Helpers\LogRequest;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use App\Events\BoardChange;
use App\Events\AssignedTaskChange;
use Illuminate\Support\Facades\Event;

class TaskController extends Controller
{
    public function taskStore(Request $request, $board_id)
    {
        $user = auth()->user();
        $board = Board::find($board_id);
        $teamModel = new Team();
        $teamId = $teamModel->findTeamIdByBoardId($board_id);

        if (!$board) {
            LogRequest::instance()->logAction('BOARD NOT FOUND', $user->user_id, "Board not found. -> board_id: $board_id", null, null, null);
            return response()->json(['error' => 'Board not found'], 404);
        }

        if (!$user->isMemberOfBoard($board_id)) {
            LogRequest::instance()->logAction('NO PERMISSION', $user->user_id, "User is not a member of this board. -> board_id: $board_id", null, null, null);
            return response()->json(['error' => 'You are not a member of this board'], 403);
        }

        $permissions = $user->getPermissions();

        if (!in_array('system_admin', $permissions)) {
            if (!$user->isMemberOfBoard($board->board_id)) {
                LogRequest::instance()->logAction('NO PERMISSION', $user->user_id, "User is not a member of the team that owns this board. -> board_id: $board_id", $teamId, $board_id, null);
                return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
            }

            $rolesOnBoard = $user->getRoles($board_id);

            $hasTaskManagementPermission = collect($rolesOnBoard)->contains(function ($role) {
                return in_array('task_management', $role->permissions->pluck('name')->toArray());
            });

            if (!$hasTaskManagementPermission) {
                LogRequest::instance()->logAction('NO PERMISSION', $user->user_id, "User does not have permission for task management.", $teamId, $board_id, null);
                return response()->json(['error' => 'You don\'t have permission to manage tasks on this board.'], 403);
            }
        }

        $column_id = $request->input('column_id');
        if ($column_id == null) {
            return response()->json(['error' => 'Column id is required'], 403);
        }

        $column = Column::where('board_id', $board_id)
            ->where('column_id', $column_id)
            ->first();

        if (!$column) {
            return response()->json(['error' => 'Column not found for the given board'], 404);
        }

        if (isset($column->task_limit) && $column->tasks()->count() >= $column->task_limit) {
            return response()->json(['error' => 'Task limit for the column has been reached'], 403);
        }

        $this->validate($request, [
            'title' => 'required|string|max:100|regex:/^[0-9a-zA-Z]/',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'column_id' => [
                'required',
                'integer',
                Rule::exists('columns', 'column_id')->where(function ($query) use ($board_id) {
                    $query->where('board_id', $board_id);
                }),
            ],
            'priority_id' => 'nullable|integer|exists:priorities,priority_id',
            'completed' => 'boolean',
        ]);

        $lastTask = Task::where('column_id', $request->input('column_id'))
            ->orderBy('position', 'desc')
            ->first();

        if ($lastTask == null) {
            $position = 1.00;
        } else {
            $position = $lastTask['position'] + 1.00;
        }

        $task = new Task([
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'due_date' => $request->input('due_date'),
            'column_id' => $request->input('column_id'),
            'board_id' => $board_id,
            'project_id' => $board->project_id,
            'priority_id' => $request->input('priority_id'),
            'position' => $position,
        ]);

        $task->save();

        $taskWithSubtasksAndTags = Task::with('subtasks', 'tags', 'comments', 'priority', 'attachments', 'members')->find($task->task_id);

        LogRequest::instance()->logAction('CREATED TASK', $user->user_id, "Created a TASK named: '$task->title'", $teamId, $board_id, $task->task_id);

        $data = [
            'task' => $taskWithSubtasksAndTags
        ];

        broadcast(new BoardChange($board_id, "CREATED_TASK", $data));

        return response()->json(['message' => 'Task created successfully', 'task' => $taskWithSubtasksAndTags]);
    }


    public function taskUpdate(Request $request, $board_id, $task_id)
    {
        $user = auth()->user();
        $board = Board::find($board_id);
        $teamModel = new Team();
        $teamId = $teamModel->findTeamIdByBoardId($board_id);

        if (!$board) {
            LogRequest::instance()->logAction('BOARD NOT FOUND', $user->user_id, "Board not found. -> board_id: $board_id", null, null, null);
            return response()->json(['error' => 'Board not found'], 404);
        }

        if (!$user->isMemberOfBoard($board_id)) {
            LogRequest::instance()->logAction('NO PERMISSION', $user->user_id, "User is not a member of this board. -> board_id: $board_id", null, null, null);
            return response()->json(['error' => 'You are not a member of this board'], 403);
        }

        $permissions = $user->getPermissions();

        if (!in_array('system_admin', $permissions)) {
            if (!$user->isMemberOfBoard($board->board_id)) {
                LogRequest::instance()->logAction('NO PERMISSION', $user->user_id, "User is not a member of the team that owns this board. -> board_id: $board_id", $teamId, $board_id, null);
                return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
            }

            $rolesOnBoard = $user->getRoles($board_id);

            $hasTaskManagementPermission = collect($rolesOnBoard)->contains(function ($role) {
                return in_array('task_management', $role->permissions->pluck('name')->toArray());
            });

            if (!$hasTaskManagementPermission) {
                LogRequest::instance()->logAction('NO PERMISSION', $user->user_id, "User does not have permission for task management.", $teamId, $board_id, null);
                return response()->json(['error' => 'You don\'t have permission to manage tasks on this board.'], 403);
            }
        }

        $task = Task::where('board_id', $board_id)->find($task_id);

        if (!$task) {
            return response()->json(['error' => 'Task not found'], 404);
        }

        $this->validate($request, [
            'title' => 'nullable|string|max:100|regex:/^[A-Za-z0-9]+/',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'priority_id' => 'nullable|integer|exists:priorities,priority_id',
            'completed' => 'nullable|boolean',
        ]);

        $originalCompletedStatus = $task->completed;

        if ($request->input('title')) {
            $task->title = $request->input('title');
        }
        if ($request->input('description')) {
            $task->description = $request->input('description');
        }
        if ($request->input('due_date')) {
            $task->due_date = $request->input('due_date');
        }
        if ($request->input('priority_id')) {
            $task->priority_id = $request->input('priority_id');
        }
        if ($request->has('completed')) {
            $task->completed = $request->input('completed');
        }

        $task->save();

        if ($task->completed != $originalCompletedStatus && $task->completed == 1) {
            LogRequest::instance()->logAction('FINISHED TASK', $user->user_id, "Finished a TASK named: '$task->title'", $teamId, $board_id, $task->task_id);
        } elseif ($task->completed != $originalCompletedStatus && $task->completed == 0) {
            LogRequest::instance()->logAction('REVERTED FINISHED TASK', $user->user_id, "Changed a TASK named: '$task->title' to not completed", $teamId, $board_id, $task->task_id);
        } else {
            LogRequest::instance()->logAction('UPDATED TASK', $user->user_id, "Updated a TASK named: '$task->title'", $teamId, $board_id, $task->task_id);
        }

        $taskWithSubtasksAndTags = Task::with('subtasks', 'tags', 'comments', 'priority', 'attachments', 'members')->find($task_id);

        $data = [
            'task' => $taskWithSubtasksAndTags
        ];
        broadcast(new BoardChange($board_id, "UPDATED_TASK", $data));

        $user_ids = UserTask::where('task_id', $task_id)->pluck('user_id')->toArray();

        foreach ($user_ids as $user_id) {
            broadcast(new AssignedTaskChange($user_id, "UPDATED_ASSIGNED_TASK_OR_SUBTASK", $data));
        }

        return response()->json(['message' => 'Task updated successfully', 'task' => $taskWithSubtasksAndTags]);
    }

    public function attributeDelete(Request $request, int $board_id, int $task_id)
    {
        $user = auth()->user();
        $board = Board::find($board_id);
        $teamModel = new Team();
        $teamId = $teamModel->findTeamIdByBoardId($board_id);

        if (!$board) {
            LogRequest::instance()
                ->logAction(
                    'BOARD NOT FOUND',
                    $user->user_id,
                    "Board not found. -> board_id: $board_id",
                    null,
                    null,
                    null
                );
            return response()->json(['error' => 'Board not found'], 404);
        }

        if (!$user->isMemberOfBoard($board_id)) {
            LogRequest::instance()
                ->logAction(
                    'NO PERMISSION',
                    $user->user_id,
                    "User is not a member of this board. -> board_id: $board_id",
                    null,
                    null,
                    null
                );
            return response()->json(
                ['error' => 'You are not a member of this board'],
                403
            );
        }

        $permissions = $user->getPermissions();

        if (!in_array('system_admin', $permissions)) {
            if (!$user->isMemberOfBoard($board->board_id)) {
                LogRequest::instance()
                    ->logAction('NO PERMISSION',
                        $user->user_id,
                        "User is not a member of the team that owns this board. -> board_id: $board_id",
                        $teamId,
                        $board_id,
                        null
                    );
                return response()->json(
                    ['error' => 'You are not a member of the team that owns this board.'],
                    403
                );
            }

            $rolesOnBoard = $user->getRoles($board_id);

            $hasTaskManagementPermission =
                collect($rolesOnBoard)->contains(function ($role) {
                return in_array(
                    'task_management',
                    $role->permissions->pluck('name')->toArray()
                );
            });

            if (!$hasTaskManagementPermission) {
                LogRequest::instance()
                    ->logAction(
                        'NO PERMISSION',
                        $user->user_id,
                        "User does not have permission for task management.",
                        $teamId,
                        $board_id,
                        null
                    );
                return response()->json(
                    ['error' => 'You don\'t have permission to manage tasks on this board.'],
                    403
                );
            }
        }

        $task = Task::where('board_id', $board_id)->find($task_id);

        if (!$task) {
            return response()->json(['error' => 'Task not found'], 404);
        }

        $this->validate($request, [
            'attributes' => 'required|array',
            'attributes.*' => 'string|in:priority_id,due_date'
        ]);

        if (in_array('priority_id', $request->input('attributes'))) {
            if (!$task->priority_id) {
                return response()->json(
                    ['error' => "The task doesn't have a priority_id attribute."],
                    400
                );
            }
            $task->priority_id = null;
        }
        if (in_array('due_date', $request->input('attributes'))) {
            if (!$task->due_date) {
                return response()->json(
                    ['error' => "The task doesn't have a due_date attribute."],
                    400
                );
            }
            $task->due_date = null;
        }

        $task->save();

        $taskWithSubtasksAndTags =
            Task::with(
                'subtasks',
                'tags',
                'comments',
                'priority',
                'attachments',
                'members'
            )->find($task_id);

        $data = [
            'task' => $taskWithSubtasksAndTags
        ];
        broadcast(new BoardChange($board_id, "UPDATED_TASK", $data));

        return response()->json([
            'message' => 'Task updated successfully',
            'task' => $taskWithSubtasksAndTags
        ]);
    }

    public function taskDestroy(Request $request, $board_id, $task_id)
    {
        $user = auth()->user();
        $board = Board::find($board_id);
        $teamModel = new Team();
        $teamId = $teamModel->findTeamIdByBoardId($board_id);

        if (!$board) {
            LogRequest::instance()->logAction('BOARD NOT FOUND', $user->user_id, "Board not found. -> board_id: $board_id", null, null, null);
            return response()->json(['error' => 'Board not found'], 404);
        }

        if (!$user->isMemberOfBoard($board_id)) {
            LogRequest::instance()->logAction('NO PERMISSION', $user->user_id, "User is not a member of this board. -> board_id: $board_id", null, null, null);
            return response()->json(['error' => 'You are not a member of this board'], 403);
        }

        $permissions = $user->getPermissions();

        if (!in_array('system_admin', $permissions)) {
            if (!$user->isMemberOfBoard($board->board_id)) {
                LogRequest::instance()->logAction('NO PERMISSION', $user->user_id, "User is not a member of the team that owns this board. -> board_id: $board_id", $teamId, $board_id, null);
                return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
            }

            $rolesOnBoard = $user->getRoles($board_id);

            $hasTaskManagementPermission = collect($rolesOnBoard)->contains(function ($role) {
                return in_array('task_management', $role->permissions->pluck('name')->toArray());
            });

            if (!$hasTaskManagementPermission) {
                LogRequest::instance()->logAction('NO PERMISSION', $user->user_id, "User does not have permission for task management.", $teamId, $board_id, null);
                return response()->json(['error' => 'You don\'t have permission to manage tasks on this board.'], 403);
            }
        }

        $task = Task::where('board_id', $board_id)->find($task_id);

        if (!$task) {
            return response()->json(['error' => 'Task not found'], 404);
        }

        $task->attachments()->delete();

        foreach ($task->comments as $comment) {
            $comment->mentions()->delete();
            $comment->delete();
        }

        FavouriteTask::where('task_id', $task_id)->delete();

        Log::where('task_id', $task_id)->delete();

        TaskTag::where('task_id', $task_id)->delete();

        Feedback::where('task_id', $task_id)->delete();

        $user_ids = UserTask::where('task_id', $task_id)->pluck('user_id')->toArray();

        UserTask::Where('task_id', $task_id)->delete();

        $task->delete();

        $data = [
            'task' => $task
        ];
        broadcast(new BoardChange($board_id, "DELETED_TASK", $data));

        foreach ($user_ids as $user_id) {
            NotificationController::createNotification(NotificationType::BOARD, "A task you have been assigned got deleted: " . $task->title, $user_id);

            broadcast(new AssignedTaskChange($user_id, "UNASSIGNED_FROM_TASK", $data));
        }

        LogRequest::instance()->logAction('DELETED TASK', $user->user_id, "Deleted a TASK named: '$task->title'", $teamId, $board_id, null);

        return response()->json(['message' => 'Task deleted successfully']);
    }

    public function taskPositionUpdate(Request $request, $column_id)
    {
        $user = auth()->user();
        $column = Column::find($column_id);

        if (!$column) {
            return response()->json(['error' => 'Column not found'], 404);
        }

        $board = $column->board;
        $teamModel = new Team();
        $teamId = $teamModel->findTeamIdByBoardId($board->board_id);

        if (!$user->isMemberOfBoard($board->board_id)) {
            LogRequest::instance()->logAction('NO PERMISSION', $user->user_id, "User is not a member of this board. -> board_id: {$board->board_id}", null, null, null);
            return response()->json(['error' => 'You are not a member of this board'], 403);
        }

        $permissions = $user->getPermissions();

        if (!in_array('system_admin', $permissions)) {
            if (!$user->isMemberOfBoard($board->board_id)) {
                LogRequest::instance()->logAction('NO PERMISSION', $user->user_id, "User is not a member of the team that owns this board. -> board_id: {$board->board_id}", $teamId, $board->board_id, null);
                return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
            }

            $rolesOnBoard = $user->getRoles($board->board_id);

            $hasTaskManagementPermission = collect($rolesOnBoard)->contains(function ($role) {
                return in_array('task_management', $role->permissions->pluck('name')->toArray());
            });

            if (!$hasTaskManagementPermission) {
                LogRequest::instance()->logAction('NO PERMISSION', $user->user_id, "User does not have permission for task management.", $teamId, $board->board_id, null);
                return response()->json(['error' => 'You don\'t have permission to manage tasks on this board.'], 403);
            }
        }

        $tasks = $request->tasks;
        $positions = array_column($tasks, 'position');
        if (count($positions) !== count(array_unique($positions))) {
            return response()->json(['error' => 'Duplicate positions are not allowed'], 403);
        }

        foreach ($tasks as &$task) {
            $taskToUpdate = Task::with('subtasks', 'tags', 'comments', 'priority', 'attachments', 'members')->find($task['task_id']);
            if ($taskToUpdate) {
                $task['old_column_id'] = $taskToUpdate->column_id;
                $oldColumnId = $taskToUpdate->column_id;
                $oldColumn = Column::find($oldColumnId);
                $task['task'] = $taskToUpdate;

                $taskToUpdate->position = $task['position'];
                if (isset($task['column_id']) && $task['column_id'] != $taskToUpdate->column_id) {
                    $newColumn = Column::find($task['column_id']);
                    if ($newColumn && $newColumn->board_id === $board->board_id) {
                        if (isset($newColumn->task_limit) && $newColumn->tasks()->count() >= $newColumn->task_limit) {
                            return response()->json(['error' => 'Task limit for the new column has been reached'], 403);
                        }
                        $taskToUpdate->column_id = $task['column_id'];
                        $taskToUpdate->completed = $newColumn->is_finished;
                        if (isset($taskToUpdate->subtasks)) {
                            self::updateColumnIdForSubtasks($taskToUpdate->subtasks, $task['column_id']);
                        }
                    } else {
                        return response()->json(['error' => 'Column not found or you are not a member of this board'], 404);
                    }
                }

                if ($taskToUpdate->completed == 1 && $oldColumnId != $taskToUpdate->column_id) {
                    LogRequest::instance()->logAction('FINISHED TASK', $user->user_id, "Finished a TASK named: '$taskToUpdate->title'", $teamId, $board->board_id, $taskToUpdate->task_id);
                } else if ($taskToUpdate->completed == 0 && $oldColumn->is_finished == 1) {
                    LogRequest::instance()->logAction('REVERTED FINISHED TASK', $user->user_id, "Changed a TASK named: '$taskToUpdate->title' to not completed", $teamId, $board->board_id, $taskToUpdate->task_id);
                } else if ($oldColumnId != $taskToUpdate->column_id) {
                    LogRequest::instance()->logAction('UPDATED TASK', $user->user_id, "Moved a TASK named: '$taskToUpdate->title' from COLUMN '$oldColumn->name' TO '$newColumn->name'", $teamId, $board->board_id, $taskToUpdate->task_id);
                } else if ($oldColumnId == $taskToUpdate->column_id) {
                    LogRequest::instance()->logAction('UPDATED TASK', $user->user_id, "Moved a TASK named: '$taskToUpdate->title' in it's own column", $teamId, $board->board_id, $taskToUpdate->task_id);
                }

                $taskToUpdate->save();
            } else {
                return response()->json(['error' => 'Task not found'], 404);
            }
        }

        $data = [
            'tasks' => $tasks
        ];

        broadcast(new BoardChange($board->board_id, "POSITION_UPDATED_TASK", $data));

        return response()->json(['message' => 'Tasks position updated successfully.']);
    }

    public function updateColumnIdForSubtasks($tasks, $new_column_id)
    {
        foreach ($tasks as &$task) {
            $task->column_id = $new_column_id;
            $task->save();
            if (isset($task->subtasks)) {
                self::updateColumnIdForSubtasks($task->subtasks, $new_column_id);
            }
        }
    }

    public function showSubtasks(Request $request, $board_id, $task_id)
    {
        $user = auth()->user();
        $board = Board::find($board_id);

        if (!$board) {
            return response()->json(['error' => 'Board not found'], 404);
        }

        if (!$user->isMemberOfBoard($board_id)) {
            return response()->json(['error' => 'You are not a member of this board'], 403);
        }

        $task = Task::where('board_id', $board_id)->find($task_id);

        if (!$task) {
            return response()->json(['error' => 'Task not found'], 404);
        }

        $subtasks = $task->where('parent_task_id', $task_id)->get();

        if ($subtasks->isEmpty()) {
            return response()->json(['error' => 'No subtasks found for the given task'], 404);
        }

        return response()->json(['message' => 'Subtasks retrieved successfully', 'subtasks' => $subtasks]);
    }


    public function subtaskStore(Request $request, $board_id, $parent_task_id)
    {
        $user = auth()->user();
        $board = Board::find($board_id);
        $teamModel = new Team();
        $teamId = $teamModel->findTeamIdByBoardId($board_id);

        if (!$board) {
            LogRequest::instance()->logAction('BOARD NOT FOUND', $user->user_id, "Board not found. -> board_id: $board_id", null, null, null);
            return response()->json(['error' => 'Board not found'], 404);
        }

        if (!$user->isMemberOfBoard($board_id)) {
            LogRequest::instance()->logAction('NO PERMISSION', $user->user_id, "User is not a member of this board. -> board_id: $board_id", null, null, null);
            return response()->json(['error' => 'You are not a member of this board'], 403);
        }

        $permissions = $user->getPermissions();

        if (!in_array('system_admin', $permissions)) {
            if (!$user->isMemberOfBoard($board->board_id)) {
                LogRequest::instance()->logAction('NO PERMISSION', $user->user_id, "User is not a member of the team that owns this board. -> board_id: $board_id", $teamId, $board_id, null);
                return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
            }

            $rolesOnBoard = $user->getRoles($board_id);

            $hasTaskManagementPermission = collect($rolesOnBoard)->contains(function ($role) {
                return in_array('task_management', $role->permissions->pluck('name')->toArray());
            });

            if (!$hasTaskManagementPermission) {
                LogRequest::instance()->logAction('NO PERMISSION', $user->user_id, "User does not have permission for task management.", $teamId, $board_id, null);
                return response()->json(['error' => 'You don\'t have permission to manage tasks on this board.'], 403);
            }
        }

        $parentTask = Task::find($parent_task_id);

        if (!$parentTask || $parentTask->board_id != $board_id) {
            return response()->json(['error' => 'Parent task not found or does not belong to this board'], 404);
        }

        $subTask = new Task([
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'due_date' => $request->input('due_date'),
            'column_id' => $parentTask->column_id,
            'board_id' => $board_id,
            'project_id' => $board->project_id,
            'priority_id' => $request->input('priority_id'),
            'parent_task_id' => $parentTask->task_id,
            'position' => null,
        ]);

        $subTask->save();

        $subTaskWithSubtasksAndTagsAndComments = Task::with('subtasks', 'tags', 'comments', 'priority', 'attachments', 'members')->find($subTask->task_id);

        $data = [
            'subtask' => $subTaskWithSubtasksAndTagsAndComments
        ];
        broadcast(new BoardChange($board->board_id, "CREATED_SUBTASK", $data));

        LogRequest::instance()->logAction('CREATED TASK', $user->user_id, "Created a SUBTASK named: '$subTask->title' in TASK: '$parentTask->title'", $teamId, $board_id, $subTask->task_id);

        $user_ids = UserTask::where('task_id', $parent_task_id)->pluck('user_id')->toArray();

        foreach ($user_ids as $user_id) {
            broadcast(new AssignedTaskChange($user_id, "CREATED_SUBTASK_FOR_ASSIGNED_TASK", $data));
        }

        return response()->json(['message' => 'Subtask created successfully', 'task' => $subTaskWithSubtasksAndTagsAndComments]);
    }

    public function subtaskUpdate(Request $request, $board_id, $subtask_id)
    {
        $user = auth()->user();
        $board = Board::find($board_id);
        $teamModel = new Team();
        $teamId = $teamModel->findTeamIdByBoardId($board_id);

        if (!$board) {
            return response()->json(['error' => 'Board not found'], 404);
        }

        if (!$user->isMemberOfBoard($board_id)) {
            return response()->json(['error' => 'You are not a member of this board'], 403);
        }

        $subTask = Task::find($subtask_id);

        if (!$subTask || $subTask->board_id != $board_id || $subTask->parent_task_id === null) {
            return response()->json(['error' => 'Subtask not found or does not belong to this board'], 404);
        }

        $subTask->title = $request->input('title', $subTask->title);
        $subTask->description = $request->input('description', $subTask->description);
        $subTask->due_date = $request->input('due_date', $subTask->due_date);
        $subTask->priority_id = $request->input('priority_id', $subTask->priority_id);

        $subTask->save();

        $subTaskWithSubtasksAndTags = Task::with('subtasks', 'tags', 'comments', 'priority', 'attachments', 'members')->find($subtask_id);

        $data = [
            'task' => $subTaskWithSubtasksAndTags
        ];
        broadcast(new BoardChange($board->board_id, "UPDATED_TASK", $data));

        LogRequest::instance()->logAction('UPDATED TASK', $user->user_id, "Updated a SUBTASK named: '$subTask->title'", $teamId, $board_id, $subtask_id);

        $user_ids = null;
        if ($subTask->parent_task_id !== null) {
            $user_ids = UserTask::where('task_id', $subtask_id)->orWhere('task_id', $subTask->parent_task_id)->pluck('user_id')->toArray();
        } else {
            $user_ids = UserTask::where('task_id', $subtask_id)->pluck('user_id')->toArray();
        }

        $data = [
            'task' => $subTaskWithSubtasksAndTags
        ];
        foreach ($user_ids as $user_id) {
            broadcast(new AssignedTaskChange($user_id, "UPDATED_ASSIGNED_TASK_OR_SUBTASK", $data));
        }

        return response()->json(['message' => 'Subtask updated successfully', 'task' => $subTaskWithSubtasksAndTags]);
    }

    public function subtaskDestroy(Request $request, $board_id, $subtask_id)
    {
        $user = auth()->user();
        $board = Board::find($board_id);
        $teamModel = new Team();
        $teamId = $teamModel->findTeamIdByBoardId($board_id);

        if (!$board) {
            return response()->json(['error' => 'Board not found'], 404);
        }

        if (!$user->isMemberOfBoard($board_id)) {
            return response()->json(['error' => 'You are not a member of this board'], 403);
        }

        $subTask = Task::find($subtask_id);

        if (!$subTask || $subTask->board_id != $board_id || $subTask->parent_task_id === null) {
            return response()->json(['error' => 'Subtask not found or does not belong to this board'], 404);
        }

        $user_ids = UserTask::where('task_id', $subTask->parent_task_id)->pluck('user_id')->toArray();

        $subTask->delete();

        $data = [
            'subtask' => $subTask
        ];
        broadcast(new BoardChange($board->board_id, "DELETED_SUBTASK", $data));

        LogRequest::instance()->logAction('DELETED TASK', $user->user_id, "Deleted a SUBTASK named: '$subTask->title'", $teamId, $board_id, $subtask_id);

        foreach ($user_ids as $user_id) {
            broadcast(new AssignedTaskChange($user_id, "DELETED_SUBTASK_FOR_ASSIGNED_TASK", $data));
        }

        return response()->json(['message' => 'Subtask deleted successfully']);
    }

    public function createTasksWithSubtasks(Request $request, $boardId, $columnId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized.'], 401);
        }

        $board = Board::where('board_id', $boardId)->first();
        if (!$board) {
            return response()->json(['error' => 'Board not found.'], 404);
        }

        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        if (!$board->columns->contains('column_id', $columnId)) {
            return response()->json(['error' => 'Column not found.'], 404);
        }

        $tasksData = $request->all();
        $validatedTasksData = [];

        $existingPositions = Task::where('board_id', $boardId)
            ->where('column_id', $columnId)
            ->pluck('position')
            ->toArray();

        $invalidPriorityIds = array_filter($tasksData, function ($taskData) {
            return !isset($taskData['priority_id']) || !in_array($taskData['priority_id'], [1, 2, 3, 4]);
        });

        if (!empty($invalidPriorityIds)) {
            return response()->json(['error' => 'Invalid priority_id.'], 400);
        }

        $validationErrors = [];

        foreach ($tasksData as $taskData) {
            $position = $taskData['position'] ?? null;
            if ($position !== null && in_array($position, $existingPositions)) {
                return response()->json(['error' => "Position $position already exists in the column."], 400);
            }

            $validatedTasksData[] = $taskData;
        }

        $tasks = [];

        DB::beginTransaction();

        try {
            foreach ($validatedTasksData as $taskData) {
                $mainTask = $this->createTask($taskData, $boardId, $columnId);
                if (isset($taskData['tasks']) && is_array($taskData['tasks'])) {
                    $this->createSubtasks($mainTask, $taskData['tasks'], $boardId, $columnId);
                }
                $tasks[] = $mainTask;
            }

            DB::commit();

        } catch (\Exception $e) {
            DB::rollback();

            return response()->json(['error' => 'There was an error while creating tasks and subtasks.'], 500);
        }

        return response()->json(['message' => 'Tasks and subtasks created successfully'], 201);
    }

    private function createTask($data, $boardId, $columnId)
    {
        $task = new Task([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'due_date' => $data['due_date'] ?? null,
            'board_id' => $boardId,
            'column_id' => $columnId,
            'project_id' => $data['project_id'] ?? null,
            'priority_id' => $data['priority_id'] ?? null,
            'position' => $data['position'] ?? null,
        ]);

        $task->save();

        return $task;
    }

    private function createSubtasks($parentTask, $subtasks, $boardId, $columnId)
    {
        foreach ($subtasks as $subtaskData) {
            $subtask = $this->createTask($subtaskData, $boardId, $columnId);
            $subtask->parentTask()->associate($parentTask);
            $subtask->save();

            if (isset($subtaskData['tasks']) && is_array($subtaskData['tasks'])) {
                $this->createSubtasks($subtask, $subtaskData['tasks'], $boardId, $columnId);
            }
        }
    }

    public function addSubtasksToExistingTask(Request $request, $boardId, $columnId, $taskId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized.'], 401);
        }

        $task = Task::find($taskId);
        if (!$task) {
            return response()->json(['error' => 'Task not found.'], 404);
        }

        $board = Board::where('board_id', $boardId)->first();
        if (!$board) {
            return response()->json(['error' => 'Board not found.'], 404);
        }

        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }
        if (!$board->columns->contains('column_id', $columnId)) {
            return response()->json(['error' => 'Column not found.'], 404);
        }

        $subtasksData = $request->all();

        $validator = Validator::make($subtasksData, [
            '*.title' => 'string|max:100',
            '*.tasks.*.title' => 'string|max:100',
            '*.description' => 'nullable|string|max:1000',
            '*.tasks.*.description' => 'nullable|string|max:1000',
            '*.priority_id' => 'in:1,2,3,4',
            '*.tasks.*.priority_id' => 'in:1,2,3,4',
            '*.due_date' => 'nullable|date|after:today',
            '*.tasks.*.due_date' => 'nullable|date|after:today',
        ]);

        if ($validator->fails()) {
            $errorMessages = [];
            foreach ($validator->errors()->all() as $errorMessage) {
                $errorMessages[] = $errorMessage;
            }
            $formattedError = implode(" ", $errorMessages);
            return response()->json(['error' => $formattedError], 400);
        }

        $lastTaskInColumn = Task::where('board_id', $boardId)
            ->where('column_id', $columnId)
            ->orderByDesc('position')
            ->first();

        $validationErrors = [];

        foreach ($subtasksData as $subtaskData) {

            if (isset($subtaskData['priority_id'])) {
                $validPriorityIds = [1, 2, 3, 4];
                if (!in_array($subtaskData['priority_id'], $validPriorityIds)) {
                    $validationErrors[] = 'Invalid priority_id.';
                }
            }

            if ($lastTaskInColumn && isset($subtaskData['position']) && $subtaskData['position'] <= $lastTaskInColumn->position) {
                $validationErrors[] = 'Invalid position.';
            }
        }

        if (!empty($validationErrors)) {
            return response()->json(['error' => implode(' ', $validationErrors)], 400);
        }

        foreach ($subtasksData as $subtaskData) {
            $subtask = $this->createTask($subtaskData, $task->board_id, $task->column_id);
            $subtask->parentTask()->associate($task);
            $subtask->save();

            if (isset($subtaskData['tasks']) && is_array($subtaskData['tasks'])) {
                $this->createSubtasks($subtask, $subtaskData['tasks'], $task->board_id, $task->column_id);
            }
        }

        return response()->json(['message' => 'Subtasks added successfully'], 201);
    }

    private function updateSubtasks($parentTask, $subtasks)
    {
        foreach ($subtasks as $subtaskData) {
            if (isset($subtaskData['task_id'])) {
                $subtask = Task::find($subtaskData['task_id']);

                if ($subtask) {
                    $subtask->update(array_filter($subtaskData, function ($value) {
                        return !is_array($value);
                    }));

                    if (isset($subtaskData['tasks']) && is_array($subtaskData['tasks'])) {
                        $this->updateSubtasks($subtask, $subtaskData['tasks']);
                    }
                }
            }
        }
    }


    public function updateExistingTask(Request $request, $boardId, $columnId, $taskId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized.'], 401);
        }

        $task = Task::find($taskId);
        if (!$task) {
            return response()->json(['error' => 'Task not found.'], 404);
        }

        $board = Board::where('board_id', $boardId)->first();
        if (!$board) {
            return response()->json(['error' => 'Board not found.'], 404);
        }

        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }
        if (!$board->columns->contains('column_id', $columnId)) {
            return response()->json(['error' => 'Column not found.'], 404);
        }

        $subtasksData = $request->input('tasks', []);

        $validator = Validator::make($subtasksData, [
            '*.title' => 'string|max:100',
            '*.tasks.*.title' => 'string|max:100',
            '*.description' => 'nullable|string|max:1000',
            '*.tasks.*.description' => 'nullable|string|max:1000',
            '*.priority_id' => 'in:1,2,3,4',
            '*.tasks.*.priority_id' => 'in:1,2,3,4',
            '*.due_date' => 'nullable|date|after:today',
            '*.tasks.*.due_date' => 'nullable|date|after:today',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $this->updateSubtasks($task, $subtasksData);

        return response()->json(['message' => 'Subtasks updated successfully'], 200);
    }

    public function deleteExistingTaskWithItsSubtasks($boardId, $columnId, $taskId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized.'], 401);
        }

        $task = Task::find($taskId);
        if (!$task) {
            return response()->json(['error' => 'Task not found.'], 404);
        }

        $board = Board::where('board_id', $boardId)->first();
        if (!$board) {
            return response()->json(['error' => 'Board not found.'], 404);
        }

        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }
        if (!$board->columns->contains('column_id', $columnId)) {
            return response()->json(['error' => 'Column not found.'], 404);
        }

        foreach ($task->subtasks as $subtask) {
            $this->deleteExistingTaskWithItsSubtasks($boardId, $columnId, $subtask->id);
        }

        $subtasks = Task::where('parent_task_id', $taskId)->get();
        foreach ($subtasks as $subtask) {
            $subtask->delete();
        }

        $task->attachments()->delete();

        foreach ($task->comments as $comment) {
            $comment->mentions()->delete();
            $comment->delete();
        }

        FavouriteTask::where('task_id', $taskId)->delete();

        Log::where('task_id', $taskId)->delete();

        TaskTag::where('task_id', $taskId)->delete();

        Feedback::where('task_id', $taskId)->delete();

        $task->delete();

        return response()->json(['message' => 'The task and its subtasks deleted successfully']);
    }

    public function updateTasksWithSubtasks(Request $request, $boardId, $columnId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized.'], 401);
        }

        $board = Board::where('board_id', $boardId)->first();
        if (!$board) {
            return response()->json(['error' => 'Board not found.'], 404);
        }

        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        if (!$board->columns->contains('column_id', $columnId)) {
            return response()->json(['error' => 'Column not found.'], 404);
        }

        $tasksData = $request->all();

        DB::beginTransaction();

        $highestPosition = Task::where('column_id', $columnId)->max('position');

        try {
            foreach ($tasksData as $index => &$taskData) {
                $validator = Validator::make($tasksData, [
                    '*.title' => 'string|max:100',
                    '*.subtasks.*.title' => 'string|max:100',
                    '*.description' => 'nullable|string|max:1000',
                    '*.subtasks.*.description' => 'nullable|string|max:1000',
                    '*.priority_id' => 'nullable|in:1,2,3,4',
                    '*.subtasks.*.priority_id' => 'nullable|in:1,2,3,4',
                    '*.due_date' => 'nullable|date|after:today',
                    '*.subtasks.*.due_date' => 'nullable|date|after:today',
                ]);

                if ($validator->fails()) {
                    return response()->json(['errors' => $validator->errors()], 400);
                }

                if (!isset($taskData["position"])) {
                    if ($highestPosition !== null) {
                        $taskData["position"] = (int) ($highestPosition + $index + 1);
                    } else {
                        $taskData["position"] = (int) ($index + 1);
                    }
                }

                $this->processTaskData($taskData, $boardId, $columnId);
            }

            DB::commit();

            $data = [
                'column_id' => (int) $columnId,
                'tasks' => $tasksData
            ];
            broadcast(new BoardChange($boardId, "CREATED_MULTIPLE_TASKS", $data));

        } catch (\Exception $e) {
            DB::rollback();

            return response()->json(['error' => 'There was an error while updating tasks.', 'message' => $e->getMessage()], 500);
        }

        return response()->json(['message' => 'Tasks updated successfully'], 200);
    }

    private function processTaskData(&$taskData, $boardId, $columnId, $parentTask = null)
    {
        $mainTask = null; // Inicializáljuk a változót null-ra
        $taskData['column_id'] = (int) $columnId;
        $taskData['board_id'] = (int) $boardId;
        if (isset($taskData['title'])) {
            if (isset($taskData['task_id'])) {
                $existingTask = Task::find($taskData['task_id']);
                if ($existingTask) {
                    $this->updateTask($existingTask, $taskData);
                    $mainTask = $existingTask;
                }
            } else {
                $mainTask = $this->createTask($taskData, $boardId, $columnId);
                $taskData['task_id'] = $mainTask->task_id;
                $taskData['project_id'] = $mainTask->project_id;
                $taskData['priority_id'] = $mainTask->priority_id;
                $taskData['completed'] = $mainTask->completed;
                $taskData['created_at'] = $mainTask->created_at;
                $taskData['updated_at'] = $mainTask->updated_at;
                if ($parentTask !== null) {
                    $mainTask->parentTask()->associate($parentTask);
                    $taskData['parent_task_id'] = $parentTask['task_id'];
                    $mainTask->save();
                }

                $this->processTaskDataTags($taskData, $boardId);
            }

            if (isset($taskData['subtasks']) && is_array($taskData['subtasks'])) {
                foreach ($taskData['subtasks'] as &$subtaskData) {
                    $this->processTaskData($subtaskData, $boardId, $columnId, $mainTask);
                }
            }
        }
    }

    private function updateTask($task, $data)
    {
        $task->fill($data);
        $task->update($data);
    }

    private function processTaskDataTags(&$taskData, $boardId)
    {
        if (isset($taskData['tags']) && is_array($taskData['tags'])) {
            $newTagsArray = [];
            foreach ($taskData['tags'] as &$tagsData) {
                $tagExists = Tag::Where('board_id', '=', $boardId)->Where('name', '=', $tagsData)->first();
                if ($tagExists) {
                    $newTaskTag = new TaskTag();
                    $newTaskTag->board_id = $boardId;
                    $newTaskTag->task_id = $taskData['task_id'];
                    $newTaskTag->tag_id = $tagExists->tag_id;
                    $newTaskTag->save();

                    array_push($newTagsArray, $tagExists);
                } else {
                    $tag = new Tag([
                        'name' => $tagsData,
                        'color' => '#BB0000',
                        'board_id' => $boardId
                    ]);

                    $tag->save();

                    $newTaskTag = new TaskTag();
                    $newTaskTag->board_id = $boardId;
                    $newTaskTag->task_id = $taskData['task_id'];
                    $newTaskTag->tag_id = $tag->tag_id;
                    $newTaskTag->save();

                    array_push($newTagsArray, $tag);
                }
            }
            $taskData['tags'] = $newTagsArray;
        }
    }

    public function boardTaskCompletionRate(Request $request, $board_id)
    {
        $totalTasks = Task::where('board_id', $board_id)->count();
        $completedTasks = Task::where('board_id', $board_id)->where('completed', true)->count();

        if ($totalTasks > 0) {
            $completionRate = ($completedTasks / $totalTasks) * 100;
        } else {
            $completionRate = 0;
        }

        return response()->json(['completion_rate' => $completionRate]);
    }

}
