<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\Team;
use App\Models\User;
use App\Models\Board;
use App\Helpers\LogRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use App\Helpers\ExecutePythonScript;
use function app\Helpers\ExecutePythonScript\executePythonScript;


class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $teams = $user->teams()->with('boards')->get();
        //$response = ExecutePythonScript::instance()->Run();

        return response()->json([
            'teams' => $teams,
            //'response' => $response,
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
            LogRequest::instance()->logAction('CREATED BOARD', $user->user_id, "Board created successfully!", $team_id, $board->board_id, null);

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
            LogRequest::instance()->logAction('UPDATED BOARD', $user->user_id, "Board Updated successfully!", $board->team_id, $board_id, null);

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

            LogRequest::instance()->logAction('DELETED BOARD', $user->user_id, "Board Deleted successfully! -> board_id: $board_id", $board->team_id, $board_id, null);

            return response()->json(null, 204);
        } else {

            LogRequest::instance()->logAction('NO PERMISSION', $user->user_id, "User does not belong to this team. -> Delete Board", null, null, null);
            return response()->json(['error' => 'Unauthenticated'], 401);
        }
    }

    public function executeAGIBoard(Request $request)
    {
        $user = auth()->user();
        $taskPrompt = $request->header('TaskPrompt');
        $taskCounter = $request->header('TaskCounter');
        $todayDate = Carbon::today()->format('Y-m-d');

        // Prepare the prompt to be sent to the Python script
        $prompt = "Generate $taskCounter kanban tickets in JSON structure in a list with title, description, due_date (if the start date is now '$todayDate' in yyyy-MM-dd HH:mm:ss) and tags (as a list) attributes for this task: '$taskPrompt'";
        // Construct the Python command with the required arguments and path to the script

        $path = env('PYTHON_SCRIPT_PATH');
        $response = ExecutePythonScript::GenerateApiResponse($prompt, $path);

        $cleanData = trim($response);
        $cleanData = str_replace("'", "\"", $response);

        $formattedResponse = json_decode($cleanData, true);

        return $formattedResponse;
    }

}