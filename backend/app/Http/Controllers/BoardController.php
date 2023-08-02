<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Board;
use Illuminate\Validation\Rule;

class BoardController extends Controller
{
    public function show($board_id)
    {
        $user = auth()->user();
        $board = Board::with('columns.tasks')->find($board_id);

        if (!$board) {
            return response()->json(['error' => 'Board not found'], 404);
        }

        if (!$user->isMemberOfBoard($board_id)) {
            LogRequest::instance()->logAction('NO PERMISSION', $user->user_id, "Error message: You are not a member of this board -> board_id: $board_id, user_id: $user->user_id, username: $user->username");
            return response()->json(['error' => 'You are not a member of this board'], 403);
        }
        else{

            return response()->json(['board' => $board]);
        }
       
    }  
}
