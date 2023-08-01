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
        $board = Board::find($board_id);
    
        if (!$board) {
            return response()->json(['error' => 'Board not found'], 404);
        }
    
        if (!$user->isMemberOfBoard($board_id)) {
            return response()->json(['error' => 'You are not a member of this board'], 403);
        }
    
        if ($request->input('column_id') == null) {
            return response()->json(['error' => 'Column id is required'], 403);
        }
    
        $columnExists = Column::where('board_id', $board_id)
            ->where('column_id', $request->input('column_id'))
            ->exists();
    
        if (!$columnExists) {
            return response()->json(['error' => 'Column not found for the given board'], 404);
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
}
