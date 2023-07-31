<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Team;
use App\Models\Board;

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

            return response()->json(['board' => $board]);
        } else {
            return response()->json(['error' => 'Unauthenticated or board not found.'], 401);
        }
    }

    public function destroy($board_id)
    {
        $user = auth()->user();
        
        $board = Board::find($board_id);
        // Check if user belongs to the team
        if ($board && $user->teams()->where('teams.team_id', $board->team_id)->exists()) {
            $board->delete();

            return response()->json(null, 204);
        } else {
            return response()->json(['error' => 'Unauthenticated or board not found.'], 401);
        }
    }

}
