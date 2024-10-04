<?php

namespace App\Http\Controllers;

use App\Helpers\LogRequest;
use App\Models\Team;
use App\Models\Board;
use App\Models\Task;
use App\Events\BoardChange;
use App\Models\Log;

class LogController extends Controller
{
    public function index($board_id)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized.'], 404);
        }

        $board = Board::where('board_id', $board_id)->first();

        if (!$board) {
            return response()->json(['error' => 'Board not found.'], 404);
        }

        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $logsWithUser = Log::with('user')->where('board_id', $board_id)->get();


        return response()->json(['logs' => $logsWithUser], 200);
    }
}
