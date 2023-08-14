<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Board;
use App\Models\FavouriteTask;
use App\Models\Task;
use App\Models\User;


class FavouriteTaskController extends Controller
{

    public function index(Request $request, $user_id)
    {
    
      $user = auth()->user();
    
      $user = User::find($user_id);
      if(!$user) {
        return response()->json(['error' => 'User not found'], 404); 
      }
    
      $favourites = $user->favouriteTasks()
                         ->get();
    
      if($favourites->isEmpty()) {
        return response()->json([
          'message' => 'No favourite tasks found for this user'
        ], 200);
      }

      return response()->json([
         'favourites' => $favourites
      ]);
    
    }

    public function store($board_id, $task_id) {
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
    
        $taskInBoard = Task::where('board_id', $board_id)
            ->where('task_id', $task_id)
            ->first();
        if (!$taskInBoard) { 
            return response()->json(['error' => 'Task not found in the specified board'], 404); 
        } 
    
        $team = $board->team;
        if (!$team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }
    
        $existingFavouriteTask = FavouriteTask::where('user_id', $user->user_id)
            ->where('task_id', $task_id)
            ->first();
        if ($existingFavouriteTask) {
            return response()->json(['error' => 'Task is already in your favorite tasks'], 409);
        }
    
        $favouriteTask = new FavouriteTask();
        $favouriteTask->user_id = $user->user_id;
        $favouriteTask->task_id = $task_id;
        $favouriteTask->save();
    
        return response()->json(['message' => 'Task added to favorite tasks successfully.'], 201);
    }

    public function destroy($board_id, $task_id) {
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
    
        $taskInBoard = Task::where('board_id', $board_id)
            ->where('task_id', $task_id)
            ->first();
        if (!$taskInBoard) { 
            return response()->json(['error' => 'Task not found in the specified board'], 404); 
        }
    
        $team = $board->team;
        if (!$team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }
    
        $favoriteTask = FavouriteTask::where('user_id', $user->user_id)
            ->where('task_id', $task_id)
            ->first();
    
        if (!$favoriteTask) {
            return response()->json(['error' => 'Task is not in your favorite tasks'], 404);
        }
    
        $favoriteTask->delete();
    
        return response()->json(['message' => 'Task removed from favorite tasks successfully.'], 200);
    }
    

    
    
    
}
