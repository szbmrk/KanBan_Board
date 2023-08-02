<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\Team;
use App\Models\User;
use App\Models\Board;
use App\Helpers\LogRequest;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $teams = $user->teams()->with('boards')->get();

        return response()->json(['teams' => $teams]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        
        // Check if user belongs to the team
        $team_id = $request->team_id;
        if ($user->teams()->where('teams.team_id', $team_id)->exists()) {
            $board = new Board;
            $board->name = $request->name;
            $board->team_id = $team_id;
            $board->save();
    
            // Log the successful action
            $this->logAction('CREATED BOARD', $user->user_id, "Board name: $board->name, Team ID: $team_id");

            return response()->json(['board' => $board], 201);
        } else {
            return response()->json(['error' => 'User does not belong to this team.'], 403);
        }
    }
    

    public function update(Request $request, $board_id)
    {
        $user = auth()->user();
        
        $board = Board::find($board_id);
        // Check if user belongs to the team
        if ($board && $user->teams()->where('teams.team_id', $board->team_id)->exists()) {
            $board->name = $request->name;
            $board->save();

            // Log the successful action
            $this->logAction('UPDATED BOARD', $user->user_id, $board);

            return response()->json(['board' => $board]);
        } else {
            return response()->json(['error' => 'Unauthenticated or board not found.'], 401);
        }
    }

    public function destroy($board_id)
    {
        $user = auth()->user();
        
        $board = Board::find($board_id);
        if(!$board) {
            LogRequest::instance()->logAction('BOARD NOT FOUND', $user->user_id, "Message: Board not found on delete -> board_id: $board_id");
            return response()->json(['error' => 'Board not found.'], 401);
        }

        // Check if user belongs to the team
        if ($user->teams()->where('teams.team_id', $board->team_id)->exists()) {
            $board->delete();

            LogRequest::instance()->logAction('DELETED BOARD', $user->user_id, "board_id: $board_id");

            return response()->json(null, 204);
        } else {

            LogRequest::instance()->logActionMoreDetails('NO PERMISSION', $user->user_id, "Message: No permission to delete board -> board_id: $board_id", null, $board_id, null);
            return response()->json(['error' => 'No permission to delete board'], 401);
        }
    }

    private function logAction($action, $user_id, $details)
    {
        $log = new Log;
        $log->action = $action;
        $log->user_id = $user_id;
        $log->details = $details; 
        $log->created_at = now(); 
        $log->save();
    }
}
