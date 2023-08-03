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
        // Check if the user is authenticated 
        if (!$user) { 
            return response()->json(['error' => 'Unauthorized'], 401); 
        } 
    
        // Find the board with the specified ID 
        $board = Board::find($board_id); 
    
        if (!$board) { 
            return response()->json(['error' => 'Board not found'], 404); 
        } 
    
        // Find the task with the specified ID 
        $task = Task::find($task_id); 
    
        if (!$task) { 
            return response()->json(['error' => 'Task not found'], 404); 
        } 
    
        // Check if the task is in the board
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
        // Retrieve all tags for the task within the specified board
        $tags = TaskTag::where('board_id', $board_id)
            ->where('task_id', $task_id)
            ->get(); 
    
        return response()->json($tags); 
    }

    public function store($board_id, $task_id, $tag_id) {

        $user = auth()->user();
        // Check if the user is authenticated 
        if (!$user) { 
            return response()->json(['error' => 'Unauthorized'], 401); 
        } 
    
        // Find the board with the specified ID 
        $board = Board::find($board_id); 
    
        if (!$board) { 
            return response()->json(['error' => 'Board not found'], 404); 
        } 
    
        // Find the task with the specified ID 
        $task = Task::find($task_id); 
    
        if (!$task) { 
            return response()->json(['error' => 'Task not found'], 404); 
        } 
    
        // Check if the task is in the board
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
        // Check if the tag already exists for the task on the board
        $existingTaskTag = TaskTag::where('board_id', $board_id)
            ->where('task_id', $task_id)
            ->where('tag_id', $tag_id)
            ->first();

        if ($existingTaskTag) {
            return response()->json(['error' => 'Tag already exists for the task on the board'], 409);
        }

        // Create a new task tag
        $taskTag = new TaskTag();
        $taskTag->board_id = $board_id;
        $taskTag->task_id = $task_id;
        $taskTag->tag_id = $tag_id;
        $taskTag->save();

        // Return the newly created task tag
        return response()->json($taskTag);
    }

    public function destroy($board_id, $task_id, $tag_id) {

        $user = auth()->user();
        // Check if the user is authenticated 
        if (!$user) { 
            return response()->json(['error' => 'Unauthorized'], 401); 
        } 
    
        // Find the board with the specified ID 
        $board = Board::find($board_id); 
    
        if (!$board) { 
            return response()->json(['error' => 'Board not found'], 404); 
        } 
    
        // Find the task with the specified ID 
        $task = Task::find($task_id); 
    
        if (!$task) { 
            return response()->json(['error' => 'Task not found'], 404); 
        } 
    
        // Check if the task is in the board
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
        // Check if the tag exists on the task tags table
        $taskTag = TaskTag::where('board_id', $board_id)
            ->where('task_id', $task_id)
            ->where('tag_id', $tag_id)
            ->first();

        if (!$taskTag) {
            return response()->json(['error' => 'Tag not found'], 404);
        }

        // Delete the task tag
        TaskTag::where('board_id', $board_id)
            ->where('task_id', $task_id)
            ->where('tag_id', $tag_id)
            ->delete();

        return response()->json(['message' => 'Task tag deleted successfully'], 200);
    }

}







