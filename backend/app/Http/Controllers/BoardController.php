<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Board;
use App\Models\Column;
use App\Models\Task;

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
            return response()->json(['error' => 'You are not a member of this board'], 403);
        }
        else{

            return response()->json(['board' => $board]);
        }
       
    }

    public function updateColumn(Request $request, $column_id)
    {
        $user = auth()->user();
        $column = Column::find($column_id);
    
        if (!$column) {
            return response()->json(['error' => 'Column not found'], 404);
        }
    
        if (!$user->isMemberOfBoard($column->board_id)) {
            return response()->json(['error' => 'You are not a member of this board'], 403);
        }
        else {
            $column->name = $request->name;
            $column->is_finished = $request->is_finished;
            $column->task_limit = $request->task_limit;
            $column->save();
    
            return response()->json(['column' => $column]);
        }
    }
    
}
