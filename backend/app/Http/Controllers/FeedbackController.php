<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Board;
use App\Models\Task;
use App\Models\Feedback;
use Illuminate\Validation\ValidationException;

class FeedbackController extends Controller
{
    public function index($boardId, $taskId) {

        // User manuális lekérdezése a sessionből
        $user = auth()->user();
      
        if (!$user) {
          return response()->json(['error' => 'Unauthorized'], 401);
        }
      
        $board = Board::find($boardId);
      
        if (!$board) { 
          return response()->json(['error' => 'Board not found'], 404);
        }

        if (!$board->team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }
      
        $task = Task::find($taskId);
      
        if (!$task) {
          return response()->json(['error' => 'Task not found'], 404);
        }
      
        if ($task->board_id != $boardId) {
          return response()->json(['error' => 'Task is not found in this board'], 400);
        }
        
        $feedbacks = Feedback::where('task_id', $taskId)->get();

        if ($feedbacks->isEmpty()) {
            return response()->json([
              'error' => 'No feedbacks found for this task'
            ], 404);
          }
      
        return response()->json($feedbacks);
      }

      public function store(Request $request, $boardId, $taskId) {

        $user = auth()->user();
      
        if (!$user) {
          return response()->json(['error' => 'Unauthorized'], 401);
        }
      
        $board = Board::find($boardId);
      
        if (!$board) { 
          return response()->json(['error' => 'Board not found'], 404);
        }

        if (!$board->team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }
      
        $task = Task::find($taskId);
      
        if (!$task) {
          return response()->json(['error' => 'Task not found'], 404);
        }
      
        if ($task->board_id != $boardId) {
          return response()->json(['error' => 'Task is not found in this board'], 400);
        }

        $existing = Feedback::where('user_id', auth()->id())
                       ->where('task_id', $taskId)
                       ->exists();
                       
        if($existing) {
            return response()->json(['error' => 'Feedback already provided for this task'], 400);
        }

        try{ 
            $this->validate($request, [
            'difficulty_level' => 'required|in:VERY EASY,EASY,MEDIUM,HARD,VERY HARD', 
            ]);
        }
        catch (ValidationException) 
        {
            return response()->json(['error' => 'Invalid difficulty level'], 400);
        }

        try{
            $this->validate($request, [
              'user_rating' => 'required|in:1,2,3,4,5'
            ]);
            }
        catch (ValidationException) 
        {
            return response()->json(['error' => 'Invalid user rating'], 400);
        }
      
        $feedback = new Feedback;
        $feedback->task_id = $taskId;
        $feedback->user_id = auth()->id();
        $feedback->text = $request->input('text');
        $feedback->difficulty_level = $request->input('difficulty_level');
        $feedback->user_rating = $request->input('user_rating');

        $feedback->save();
      
        return response()->json(['message' => 'Feedback created successfully'], 201);
    
      }

      public function update(Request $request, $boardId, $taskId, $feedbackId) 
      {
        $user = auth()->user();
        if(!$user) {
          return response()->json(['error' => 'Unauthorized'], 401);
        }

        $board = Board::find($boardId);
      
        if (!$board) { 
          return response()->json(['error' => 'Board not found'], 404);
        }

        if (!$board->team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }
      
        $task = Task::find($taskId);
      
        if (!$task) {
          return response()->json(['error' => 'Task not found'], 404);
        }
      
        if ($task->board_id != $boardId) {
          return response()->json(['error' => 'Task is not found in this board'], 400);
        }

        $feedback = Feedback::find($feedbackId);
        if(!$feedback) { 
          return response()->json(['error' => 'Feedback not found'], 404);
        }

        if ($feedback->user_id != $user->user_id) {
            return response()->json(['error' => 'Permission denied'], 403);
        }
      
        try{ 
            $this->validate($request, ['difficulty_level' => 'required|in:VERY EASY,EASY,MEDIUM,HARD,VERY HARD']);
        }
        catch (ValidationException) 
        {
            return response()->json(['error' => 'Invalid difficulty level'], 400);
        }
        
        try
        {
            $this->validate($request, ['user_rating' => 'required|in:1,2,3,4,5']);
        }
        catch (ValidationException) 
        {
            return response()->json(['error' => 'Invalid user rating'], 400);
        }

        if ($feedback->text === $request->input('text') &&
        $feedback->difficulty_level === $request->input('difficulty_level') &&
        $feedback->user_rating === $request->input('user_rating')) 
        {
            return response()->json(['error' => 'No changes were made.'], 400);
        }
      
        $feedback->text = $request->input('text');
        $feedback->difficulty_level = $request->input('difficulty_level');
        $feedback->user_rating = $request->input('user_rating');
        $feedback->save();
      
        return response()->json(['message' => 'Feedback updated successfully']);
      
    }

    public function destroy($boardId, $taskId, $feedbackId)
{
    $user = auth()->user();
    if (!$user) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    $board = Board::find($boardId);

    if (!$board) {
        return response()->json(['error' => 'Board not found'], 404);
    }

    if (!$board->team->teamMembers->contains('user_id', $user->user_id)) {
        return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
    }

    $task = Task::find($taskId);

    if (!$task) {
        return response()->json(['error' => 'Task not found'], 404);
    }

    if ($task->board_id != $boardId) {
        return response()->json(['error' => 'Task is not found in this board'], 400);
    }

    $feedback = Feedback::find($feedbackId);
    if (!$feedback) {
        return response()->json(['error' => 'Feedback not found'], 404);
    }

    if ($feedback->user_id != $user->user_id) {
        return response()->json(['error' => 'Permission denied'], 403);
    }

    $feedback->delete();

    return response()->json(['message' => 'Feedback deleted successfully']);
}

    
}
