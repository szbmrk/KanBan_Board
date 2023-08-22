<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tag;
use App\Models\Board;
use App\Models\Task;
use App\Models\TaskTag;


class TaskTagController extends Controller
{
    
    public function index($board_id, $task_id) {

        $user = auth()->user();
        if (!$user) { 
            return response()->json(['error' => 'Unauthorized'], 401); 
        } 
    
        $board = Board::find($board_id); 
    
        if (!$board) { 
            return response()->json(['error' => 'Board not found'], 404); 
        } 
    
        $task = Task::find($task_id); 
    
        if (!$task) { 
            return response()->json(['error' => 'Task not found'], 404); 
        } 
    
        $taskInBoard = TaskTag::where('board_id', $board_id)
            ->where('task_id', $task_id)
            ->first();
    
        if (!$taskInBoard) { 
            return response()->json(['error' => 'Task not found in the specified board'], 404); 
        } 
        $team = $board->team;
        if (!$team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $tags = TaskTag::where('board_id', $board_id)
            ->where('task_id', $task_id)
            ->get(); 

        $tags = $tags->sortBy('tag_id');
        
        return response()->json($tags); 
    }

    public function store($board_id, $task_id, $tag_id) {
        $user = auth()->user();
        if (!$user) { 
            return response()->json(['error' => 'Unauthorized'], 401); 
        } 
    
        $board = Board::find($board_id); 
    
        if (!$board) { 
            return response()->json(['error' => 'Board not found'], 404); 
        } 
    
        $task = Task::find($task_id); 
    
        if (!$task) { 
            return response()->json(['error' => 'Task not found'], 404); 
        } 
    
        $team = $board->team;
        if (!$team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }
    
        $existingTaskTag = TaskTag::where('board_id', $board_id)
            ->where('task_id', $task_id)
            ->where('tag_id', $tag_id)
            ->first();
    
        if ($existingTaskTag) {
            return response()->json(['error' => 'Tag already exists for the task on the board'], 409);
        }
    
        // Check if the task already exists in the TaskTag table
        $taskInBoard = TaskTag::where('task_id', $task_id)->exists();
    
        if (!$taskInBoard) { 
            // If the task doesn't exist in TaskTag table, create a new TaskTag record
            $newTaskTag = new TaskTag();
            $newTaskTag->board_id = $board_id;
            $newTaskTag->task_id = $task_id;
            $newTaskTag->tag_id = $tag_id;
            $newTaskTag->save();
    
            return response()->json(['message' => 'Task tag created successfully.'], 201);
        }
    
        // If the task already exists in TaskTag table, create a new TaskTag record
        $taskTag = new TaskTag();
        $taskTag->board_id = $board_id;
        $taskTag->task_id = $task_id;
        $taskTag->tag_id = $tag_id;
        $taskTag->save();
    
        return response()->json(['message' => 'Task tag created successfully.'], 201);
    }

    public function destroy($board_id, $task_id, $tag_id) {

        $user = auth()->user();
        if (!$user) { 
            return response()->json(['error' => 'Unauthorized'], 401); 
        } 
    
        $board = Board::find($board_id); 
    
        if (!$board) { 
            return response()->json(['error' => 'Board not found'], 404); 
        } 
    
        $task = Task::find($task_id); 
    
        if (!$task) { 
            return response()->json(['error' => 'Task not found'], 404); 
        } 
    
        $taskInBoard = TaskTag::where('board_id', $board_id)
            ->where('task_id', $task_id)
            ->first();
    
        if (!$taskInBoard) { 
            return response()->json(['error' => 'Task not found in the specified board'], 404); 
        } 
        $team = $board->team;
        if (!$team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }
        $taskTag = TaskTag::where('board_id', $board_id)
            ->where('task_id', $task_id)
            ->where('tag_id', $tag_id)
            ->first();

        if (!$taskTag) {
            return response()->json(['error' => 'Tag not found'], 404);
        }

        TaskTag::where('board_id', $board_id)
            ->where('task_id', $task_id)
            ->where('tag_id', $tag_id)
            ->delete();

        return response()->json(['message' => 'Task tag deleted successfully'], 200);
    }

}







