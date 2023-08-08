<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Board;
use App\Models\Column;
use App\Models\Task;
use App\Models\Attachment;
use App\Models\Comment;
use App\Models\Mention;
use App\Models\FavouriteTask;
use App\Models\Log;
use App\Models\TaskTag;
use App\Models\UserTask;
use App\Models\Feedback;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    public function taskStore(Request $request, $board_id)
    {
        $user = auth()->user();

        $user_id = $user->user_id;

        $board = Board::find($board_id);
        if (!$board) {
            return response()->json(['error' => 'Board not found'], 404);
        }

        if (!$user->isMemberOfBoard($board_id)) {
            return response()->json(['error' => 'You are not a member of this board'], 403);
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
            'title' => 'required|string|max:100',
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

        $task_id = $task->task_id;

        UserTask::create([
            'user_id' => $user_id,
            'task_id' => $task_id
        ]);

        return response()->json(['message' => 'Task created successfully', 'task' => $task]);
    }

    public function taskUpdate(Request $request, $board_id, $task_id)
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

        $this->validate($request, [
            'title' => 'required|string|max:100',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'priority_id' => 'nullable|integer|exists:priorities,priority_id',
        ]);

        $task->title = $request->input('title');
        $task->description = $request->input('description');
        $task->due_date = $request->input('due_date');
        $task->priority_id = $request->input('priority_id');

        $task->save();

        return response()->json(['message' => 'Task updated successfully', 'task' => $task]);
    }

    public function taskDestroy(Request $request, $board_id, $task_id)
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

        $task->attachments()->delete();

        foreach ($task->comments as $comment) {
            $comment->mentions()->delete();
            $comment->delete();
        }

        FavouriteTask::where('task_id', $task_id)->delete();

        Log::where('task_id', $task_id)->delete();

        TaskTag::where('task_id', $task_id)->delete();

        UserTask::where('task_id', $task_id)->delete();

        Feedback::where('task_id', $task_id)->delete();

        $task->delete();

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

        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of this board'], 403);
        }

        $tasks = $request->tasks;
        $positions = array_column($tasks, 'position');
        if (count($positions) !== count(array_unique($positions))) {
            return response()->json(['error' => 'Duplicate positions are not allowed'], 403);
        }

        foreach ($tasks as $task) {
            $taskToUpdate = Task::find($task['task_id']);
            if ($taskToUpdate) {
                $taskToUpdate->position = $task['position'];
                if (isset($task['column_id']) && $task['column_id'] != $taskToUpdate->column_id) {
                    $newColumn = Column::find($task['column_id']);
                    if ($newColumn && $newColumn->board_id === $board->board_id) {
                        if (isset($newColumn->task_limit) && $newColumn->tasks()->count() >= $newColumn->task_limit) {
                            return response()->json(['error' => 'Task limit for the new column has been reached'], 403);
                        }
                        $taskToUpdate->column_id = $task['column_id'];
                    } else {
                        return response()->json(['error' => 'Column not found or you are not a member of this board'], 404);
                    }
                }
                $taskToUpdate->save();
            } else {
                return response()->json(['error' => 'Task not found'], 404);
            }
        }

        return response()->json(['message' => 'Tasks position updated successfully.']);
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

        if (!$board) {
            return response()->json(['error' => 'Board not found'], 404);
        }

        if (!$user->isMemberOfBoard($board_id)) {
            return response()->json(['error' => 'You are not a member of this board'], 403);
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

        return response()->json(['message' => 'Subtask created successfully', 'task' => $subTask]);
    }

    public function subtaskUpdate(Request $request, $board_id, $subtask_id)
    {
        $user = auth()->user();
        $board = Board::find($board_id);

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

        return response()->json(['message' => 'Subtask updated successfully', 'task' => $subTask]);
    }

    public function subtaskDestroy(Request $request, $board_id, $subtask_id)
    {
        $user = auth()->user();
        $board = Board::find($board_id);

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

        $subTask->delete();

        return response()->json(['message' => 'Subtask deleted successfully']);
    }
}