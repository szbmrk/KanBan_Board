<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;

use Illuminate\Http\Request;

class TeamManagementController extends Controller
{
    public function show($id)
    {
        $user = auth()->user();

        //check if the user belong to that team
        if ($user->teams()->where('teams.team_id', $id)->exists()) {
            $team = Team::with(['teamMembers.user'])->findOrFail($id);
            return response()->json(['team' => $team]);
        } else {
            return response()->json(['error' => 'Unauthenticated or team not found.'], 401);
        }
       
    }

    public function storeTeamMember(Request $request, $teamId)
    {
        $user = auth()->user();
        
        if($user->teams()->where('teams.team_id', $teamId)->exists()){
            $this->validate($request, [
                'user_name' => 'required|string',
            ]);
    
            // Find the user based on the provided username
            $userAdd = User::where('username', $request->input('user_name'))->first();
            if($userAdd == null){
                return response()->json(['error' => 'User not found.'], 404);
            }

    
            // Check if the user is already a member of the team
            $existingTeamMember = TeamMember::where('team_id', $teamId)
                ->where('user_id', $userAdd->user_id)
                ->first();
    
            if ($existingTeamMember) {
                return response()->json(['error' => 'User is already a member of the team.'], 400);
            }
    
            // Create the team member record
            $teamMember = TeamMember::create([
                'team_id' => $teamId,
                'user_id' => $userAdd->user_id,
            ]);
    
            return response()->json(['message' => 'Team member added successfully.']);
        }
        else{
            return response()->json(['error' => 'Unauthenticated or team not found.'], 401);
        }
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
