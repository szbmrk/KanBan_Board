<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Team;
use App\Helpers\LogRequest;
use App\Models\TeamMember;

class TeamController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $teams = Team::where('created_by', $user->user_id)->get();

        return response()->json(['teams' => $teams]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();

        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $team = new Team();
        $team->name = $request->input('name');
        $team->created_by = $user->user_id;
        $team->save();

        $teamMember = new TeamMember();
        $teamMember->team_id = $team->team_id;
        $teamMember->user_id = $user->user_id;
        $teamMember->save();

        LogRequest::instance()->logAction('CREATED TEAM', $user->user_id, "Team Created successfully! -> $team->name", $team->team_id, null, null);
        $teamWithMembers = Team::with(['teamMembers.user'])->where('team_id', $team->team_id)->first();
        return response()->json(['message' => 'Team Created successfully!', 'team' => $teamWithMembers]);
    }

    public function update(Request $request, $id)
    {
        $user = auth()->user();

        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $team = Team::find($id);
        if (!$team) {
            LogRequest::instance()->logAction('TEAM NOT FOUND', $user->user_id, "Team not found on Update. -> team_id: $id", null, null, null);
            return response()->json(['message' => 'Team not found'], 404);
        }

        $team = Team::where('team_id', $id)->where('created_by', $user->user_id)->first();
        if (!$team) {
            LogRequest::instance()->logAction('NO PERMISSION', $user->user_id, "User does not have permission. -> Update Team", null, null, null);
            return response()->json(['message' => 'Unauthorized'], 404);
        }

        $team->name = $request->input('name');
        $team->save();

        LogRequest::instance()->logAction('UPDATED TEAM', $user->user_id, "Team Updated successfully!", $team->team_id, null, null);
        return response()->json(['message' => 'Team updated successfully']);
    }

    public function destroy($id)
    {
        $user = auth()->user();

        $team = Team::find($id);
        if (!$team) {
            LogRequest::instance()->logAction('TEAM NOT FOUND', $user->user_id, "Team not found on Delete. -> team_id: $id", null, null, null);
            return response()->json(['message' => 'Team not found'], 404);
        }

        $team = Team::where('team_id', $id)->where('created_by', $user->user_id)->first();
        if (!$team) {
            LogRequest::instance()->logAction('NO PERMISSION', $user->user_id, "User does not have permission. -> Delete Team", null, null, null);
            return response()->json(['message' => 'Unauthorized'], 404);
        }

        $team->delete();

        LogRequest::instance()->logAction('DELETED TEAM', $user->user_id, "Team Deleted successfully! -> team_id: $team->team_id, name: $team->name", null, null, null);

        return response()->json(['message' => 'Team deleted successfully']);
    }
}