<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Team;

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

        return response()->json(['message' => 'Team created successfully']);
    }
    public function update(Request $request, $id)
    {
        $user = auth()->user();

        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $team = Team::where('team_id', $id)->where('created_by', $user->user_id)->first();

        if (!$team) {
            return response()->json(['message' => 'Unauthorized or team not found'], 404);
        }

        $team->name = $request->input('name');
        $team->save();

        return response()->json(['message' => 'Team updated successfully']);
    }
    public function destroy($id)
    {
        $user = auth()->user();

        $team = Team::where('team_id', $id)->where('created_by', $user->user_id)->first();

        if (!$team) {
            return response()->json(['message' => 'Unauthorized or team not found'], 404);
        }

        $team->delete();

        return response()->json(['message' => 'Team deleted successfully']);
    }
}
