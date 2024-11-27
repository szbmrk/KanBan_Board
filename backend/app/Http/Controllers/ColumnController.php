<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\Task;
use App\Models\Team;
use App\Models\Board;
use App\Models\Column;
use App\Models\Comment;
use App\Models\Mention;
use App\Models\TaskTag;
use App\Models\Feedback;
use App\Models\UserTask;
use App\Models\Attachment;
use App\Helpers\LogRequest;
use Illuminate\Http\Request;
use App\Models\FavouriteTask;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use App\Events\BoardChange;
use Illuminate\Support\Facades\Event;


class ColumnController extends Controller
{
    public function columnStore(Request $request, $board_id)
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

            $hasColumnManagementPermission = collect($rolesOnBoard)->contains(function ($role) {
                return in_array('column_management', $role->permissions->pluck('name')->toArray());
            });

            if (!$hasColumnManagementPermission) {
                LogRequest::instance()->logAction('NO PERMISSION', $user->user_id, "User does not have permission for column management.", $teamId, $board_id, null);
                return response()->json(['error' => 'You don\'t have permission to manage columns on this board.'], 403);
            }
        }

        $this->validate($request, [
            'name' => 'required|string|max:50',
        ]);

        $maxPosition = $board->columns()->max('position');

        $column = new Column([
            'name' => $request->input('name'),
            'position' => $maxPosition !== null ? $maxPosition + 1 : 0,
            'board_id' => $board->board_id,
            'is_finished' => $request->input('is_finished', false),
            'task_limit' => $request->input('task_limit', null),
        ]);

        $board->columns()->save($column);

        LogRequest::instance()->logAction('CREATED COLUMN', $user->user_id, "Created a COLUMN named: '$column->name'", $teamId, $board_id, null);

        $data = [
            'column' => $column,
            'is_finished' => $request->input('is_finished'),
            'task_limit' => $request->input('task_limit'),
        ];
        broadcast(new BoardChange($board_id, "CREATED_COLUMN", $data));

        return response()->json(['message' => 'Column created successfully', 'column' => $column]);
    }

    public function columnUpdate(Request $request, $column_id)
    {
        $user = auth()->user();
        $column = Column::find($column_id);
        $teamModel = new Team();
        $teamId = $teamModel->findTeamIdByBoardId($column->board_id);

        if (!$column) {
            //LogRequest::instance()->logAction('COLUMN NOT FOUND', $user->user_id, "Column not found. -> column_id: $column_id", null, null, null);
            return response()->json(['error' => 'Column not found'], 404);
        }

        if (!$user->isMemberOfBoard($column->board_id)) {
            //LogRequest::instance()->logAction('NO PERMISSION', $user->user_id, "User is not a member of this board. -> board_id: $column->board_id", null, null, null);
            return response()->json(['error' => 'You are not a member of this board'], 403);
        } else {
            $permissions = $user->getPermissions();

            if (!in_array('system_admin', $permissions)) {
                $boardId = $column->board_id;
                $rolesOnBoard = $user->getRoles($boardId);

                // Check if the user has the necessary permission for column management
                $hasColumnManagementPermission = collect($rolesOnBoard)->contains(function ($role) {
                    return in_array('column_management', $role->permissions->pluck('name')->toArray());
                });

                if (!$hasColumnManagementPermission) {
                    return response()->json(['error' => 'You don\'t have permission to manage columns on this board.'], 403);
                }
            }

            if ($request->has('name')) {
                $column->name = $request->name;
            }
            if ($request->has('is_finished')) {
                $column->is_finished = $request->is_finished;
            }
            if ($request->has('task_limit')) {
                $column->task_limit = $request->task_limit;
            }
            $column->save();

            LogRequest::instance()->logAction('UPDATED COLUMN', $user->user_id, "Updated a COLUMN named: '$column->name'", $teamId, $column->board_id, null);

            $data = [
                'column' => $column
            ];
            broadcast(new BoardChange($column->board_id, "UPDATED_COLUMN", $data));

            return response()->json(['column' => $column]);
        }
    }

    public function columnPositionUpdate(Request $request, $board_id)
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

        $permissions = $user->getPermissions();

        if (!in_array('system_admin', $permissions)) {
            $boardId = $board_id;
            $rolesOnBoard = $user->getRoles($boardId);

            // Check if the user has the necessary permission for column management
            $hasColumnManagementPermission = collect($rolesOnBoard)->contains(function ($role) {
                return in_array('column_management', $role->permissions->pluck('name')->toArray());
            });

            if (!$hasColumnManagementPermission) {
                return response()->json(['error' => 'You don\'t have permission to manage columns on this board.'], 403);
            }
        }

        $columns = $request->columns;

        if (count($columns) !== count(array_unique($columns))) {
            return response()->json(['error' => 'Duplicate positions are not allowed'], 400);
        }

        foreach ($columns as $position => $column_id) {
            $column = Column::find($column_id);
            if ($column && $column->board_id == $board_id) {
                $column->position = $position;
                $column->save();
            } else {
                return response()->json(['error' => 'Column not found or not belong to this board'], 404);
            }
        }
        LogRequest::instance()->logAction('UPDATED COLUMN', $user->user_id, "Updated a COLUMN'S position named: '$column->name'", $teamId, $column->board_id, null);

        $data = [
            'columns' => $columns
        ];
        broadcast(new BoardChange($board_id, "POSITION_UPDATED_COLUMN", $data));

        return response()->json(['message' => 'Columns position updated successfully.']);
    }

    public function columnDestroy($board_id, $column_id)
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

        $permissions = $user->getPermissions();

        if (!in_array('system_admin', $permissions)) {
            $boardId = $board_id;
            $rolesOnBoard = $user->getRoles($boardId);

            // Check if the user has the necessary permission for column management
            $hasColumnManagementPermission = collect($rolesOnBoard)->contains(function ($role) {
                return in_array('column_management', $role->permissions->pluck('name')->toArray());
            });

            if (!$hasColumnManagementPermission) {
                return response()->json(['error' => 'You don\'t have permission to manage columns on this board.'], 403);
            }
        }

        $column = Column::where('board_id', $board_id)->find($column_id);

        if (!$column) {
            return response()->json(['error' => 'Column not found'], 404);
        }

        foreach ($column->tasks as $task) {

            $task->attachments()->delete();

            Mention::whereIn('comment_id', $task->comments->pluck('comment_id'))->delete();

            Comment::whereIn('comment_id', $task->comments->pluck('comment_id'))->delete();

            FavouriteTask::where('task_id', $task->task_id)->delete();

            Log::where('task_id', $task->task_id)->delete();

            TaskTag::where('task_id', $task->task_id)->delete();

            UserTask::where('task_id', $task->task_id)->delete();

            Feedback::where('task_id', $task->task_id)->delete();

            $task->delete();
        }

        $column->delete();

        LogRequest::instance()->logAction('DELETED COLUMN', $user->user_id, "Deleted a COLUMN named: '$column->name'", $teamId, $column->board_id, null);

        $data = [
            'column' => $column
        ];
        broadcast(new BoardChange($board_id, "DELETED_COLUMN", $data));

        return response()->json(['message' => 'Column deleted successfully!']);
    }

}

