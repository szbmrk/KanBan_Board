<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Board;
use Illuminate\Validation\Rule;
use App\Helpers\LogRequest;
use App\Models\Task;


class BoardController extends Controller
{
    public function show($board_id)
    {
        $user = auth()->user();
    
        $board = Board::with([
            'columns',
            'columns.tasks',
            'columns.tasks.favouriteTasks' => function ($query) use ($user) {
                $query->where('favourite_tasks.user_id', $user->id);
            },
            'columns.tasks.subtasks' => function ($query) use ($user) {
                $query->with(['favouriteTasks' => function ($q) use ($user) {
                    $q->where('favourite_tasks.user_id', $user->id);
                }]);
            }
        ])->find($board_id);
        
        $board->load(
            'columns.tasks.favouriteTasks', 
            'columns.tasks.subtasks.favouriteTasks',
            'columns.tasks.tags',
            'columns.tasks.subtasks.tags'
        );
        
    
   
        if (!$board) {
            LogRequest::instance()->logAction('BOARD NOT FOUND', $user->user_id, "Board not found. -> board_id: $board_id", null, null, null);
            return response()->json(['error' => 'Board not found'], 404);
        }
    
        if (!$user->isMemberOfBoard($board_id)) {
            LogRequest::instance()->logAction('NO PERMISSION', $user->user_id, "User does not have permission. -> Get Board", null, null, null);
            return response()->json(['error' => 'You are not a member of this board'], 403);
        }
    
        return response()->json($board);
    }
}