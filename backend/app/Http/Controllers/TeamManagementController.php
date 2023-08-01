<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\TeamMember;
use Illuminate\Http\Request;

class TeamManagementController extends Controller
{
    public function show($id)
    {
        // Retrieve the team with the given ID from the database along with its team members and associated users' names
        $team = Team::with(['teamMembers.user'])->findOrFail($id);

        // Return the team and team members data to the frontend
        return response()->json([
            'team' => $team,
        ]);
    }

    public function destroyTeamMember($teamId, $userId)
    {
        // Find the team member record based on the provided team ID and user ID
        $teamMember = TeamMember::where('team_id', $teamId)
            ->where('user_id', $userId)
            ->first();

        // Check if the team member exists
        if ($teamMember) {
            // Delete the team member's relationship with the team, but do not delete the entire user record
            $teamMember->delete();

            // You can optionally send a response indicating success
            return response()->json(['message' => 'Team member removed from the team successfully.']);
        } else {
            // If the team member does not exist, send a response indicating the failure
            return response()->json(['error' => 'Team member not found in the team.'], 404);
        }
    }
}
