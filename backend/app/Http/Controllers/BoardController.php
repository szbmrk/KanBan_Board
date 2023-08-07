<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Board;
use Illuminate\Validation\Rule;
use App\Helpers\LogRequest;

class BoardController extends Controller
{
    public function show($board_id)
    {
        $user = auth()->user();
        $board = Board::with('columns.tasks')->find($board_id);

        if (!$board) {
            LogRequest::instance()->logAction('BOARD NOT FOUND', $user->user_id, "Board not found. -> board_id: $board_id", null, null, null);
            return response()->json(['error' => 'Board not found'], 404);
        }

        if (!$user->isMemberOfBoard($board_id)) {
            LogRequest::instance()->logAction('NO PERMISSION', $user->user_id, "User does not have permission. -> Get Board", null, null, null);
            return response()->json(['error' => 'You are not a member of this board'], 403);
        }
        else{

            return response()->json(['board' => $board]);
        }
       
    }  
}
