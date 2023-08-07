<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Board;
use App\Models\Task;
use App\Models\Mention;

class MentionController extends Controller
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

        $comments = $task->comments;
        
        $usernames = [];
        
        foreach ($comments as $comment) {
    
            $mentions = $comment->mentions;

            foreach ($mentions as $mention) {
                $mentionedUser = $mention->user;
                
                $usernames[] = $mentionedUser->username;
            }
        
             if (empty($usernames)) {
                return response()->json(['error' => 'No mentioned usernames found.'], 404);
            }
        }
    
        return response()->json($usernames); 
    }
    
    public function store($board_id, $task_id, Request $request) 
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $board = Board::find($board_id);

        if (!$board) {
            return response()->json(['error' => 'Board not found'], 404); 
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

        $mention = new Mention;
        $mention->comment_id = $request->input('comment_id');
        $mention->user_id = $request->input('user_id');
      
        $mention->save();
      
        return response()->json(['message' => 'Mention added successfully']);
    }

    public function destroy($board_id, $task_id, $mentionId)
    {
    
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $board = Board::find($board_id);

        if (!$board) {
            return response()->json(['error' => 'Board not found'], 404); 
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
    
      $mention = Mention::find($mentionId);
    
      if (!$mention) {
        return response()->json([
          'error' => 'Mention not found'
        ], 404);
      }
    
      $mention->delete();
    
      return response()->json([
        'message' => 'Mention deleted successfully'
      ]);
    
    }
    
}
