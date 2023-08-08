<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\Team;
use App\Models\User;
use App\Models\Board;
use App\Helpers\LogRequest;
use Illuminate\Http\Request;
use App\Helpers\ExecutePythonScript;
use function app\Helpers\ExecutePythonScript\executePythonScript;


class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $teams = $user->teams()->with('boards')->get();
        $response = ExecutePythonScript::instance()->Run();

        return response()->json([
            'teams' => $teams,
            'response' => $response,
        ]);
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
            //LogRequest::instance()->logAction('CREATED BOARD', $user->user_id, "Board created successfully!", $team_id, $board->board_id, null);

            return response()->json(['board' => $board], 201);
        } else {
            LogRequest::instance()->logAction('NO PERMISSION', $user->user_id, "User does not belong to this team. -> Create Board", null, null, null);
            return response()->json(['error' => 'User does not belong to this team.'], 403);
        }
    }


    public function update(Request $request, $board_id)
    {
        $user = auth()->user();

        $board = Board::find($board_id);
        if (!$board) {
            LogRequest::instance()->logAction('BOARD NOT FOUND', $user->user_id, "Board not found on update -> board_id: $board_id", null, null, null);
            return response()->json(['error' => 'Board not found.'], 401);
        }
        // Check if user belongs to the team
        if ($user->teams()->where('teams.team_id', $board->team_id)->exists()) {
            $board->name = $request->name;
            $board->save();

            // Log the successful action
            //LogRequest::instance()->logAction('UPDATED BOARD', $user->user_id, "Board Updated successfully!", $team_id, $board->board_id, null);

            return response()->json(['board' => $board]);
        } else {

            LogRequest::instance()->logAction('NO PERMISSION', $user->user_id, "User does not belong to this team. -> Update Board", null, null, null);
            return response()->json(['error' => 'Unauthenticated'], 401);
        }
    }

    public function destroy($board_id)
    {
        $user = auth()->user();

        $board = Board::find($board_id);
        if (!$board) {
            LogRequest::instance()->logAction('BOARD NOT FOUND', $user->user_id, "Board not found on Delete. -> board_id: $board_id", null, null, null);
            return response()->json(['error' => 'Board not found.'], 401);
        }

        // Check if user belongs to the team
        if ($user->teams()->where('teams.team_id', $board->team_id)->exists()) {
            $board->delete();

            //LogRequest::instance()->logAction('DELETED BOARD', $user->user_id, "Board Deleted successfully! -> board_id: $board_id", $board->team_id, $board_id, null);

            return response()->json(null, 204);
        } else {

            LogRequest::instance()->logAction('NO PERMISSION', $user->user_id, "User does not belong to this team. -> Delete Board", null, null, null);
            return response()->json(['error' => 'Unauthenticated'], 401);
        }
    }

    public function executeAGIBoard(Request $request)
    {
        $user = auth()->user();
        $response = ExecutePythonScript::instance()->Run();

        $cleanData = trim($response);
        $cleanData = str_replace("'", "\"", $response);
        $formattedResponse = json_decode($cleanData, true);
        
        return $formattedResponse;
    }

}