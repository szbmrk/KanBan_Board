<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Board;
use App\Models\Task;
use App\Events\BoardChange;
use App\Models\User;


class ChangeIsDoneTaskController extends Controller
{
    public function store($board_id, $subtask_id)
    {
        $user = auth()->user();

        $board = Board::find($board_id);
        if (!$board) {
            return response()->json(['error' => 'Board not found'], 404);
        }

        $task = Task::find($subtask_id);
        if (!$task) {
            return response()->json(['error' => 'Task not found'], 404);
        }

        $taskInBoard = Task::where('board_id', $board_id)
            ->where('task_id', $subtask_id)
            ->first();
        if (!$taskInBoard) {
            return response()->json(['error' => 'Task not found in the specified board'], 404);
        }

        $taskInBoard->completed = true;

        $taskInBoard->save();

        $subTaskWithSubtasksAndTags = Task::with('subtasks', 'tags', 'comments', 'priority', 'attachments', 'members')->find($subtask_id);

        $data = [
            'subtask' => $subTaskWithSubtasksAndTags
        ];
        broadcast(new BoardChange($board->board_id, "CHANGE_ISDONE_SUBTASK", $data));

        return response()->json(['message' => 'Subtask updated successfully', 'task' => $subTaskWithSubtasksAndTags]);
    }

    public function destroy($board_id, $subtask_id)
    {
        $user = auth()->user();

        $board = Board::find($board_id);
        if (!$board) {
            return response()->json(['error' => 'Board not found'], 404);
        }

        $task = Task::find($subtask_id);
        if (!$task) {
            return response()->json(['error' => 'Task not found'], 404);
        }

        $taskInBoard = Task::where('board_id', $board_id)
            ->where('task_id', $subtask_id)
            ->first();
        if (!$taskInBoard) {
            return response()->json(['error' => 'Task not found in the specified board'], 404);
        }

        $taskInBoard->completed = false;

        $taskInBoard->save();

        $subTaskWithSubtasksAndTags = Task::with('subtasks', 'tags', 'comments', 'priority', 'attachments', 'members')->find($subtask_id);

        $data = [
            'subtask' => $subTaskWithSubtasksAndTags
        ];
        broadcast(new BoardChange($board->board_id, "CHANGE_ISDONE_SUBTASK", $data));

        return response()->json(['message' => 'Subtask updated successfully', 'task' => $subTaskWithSubtasksAndTags]);
    }





}
