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
        
        if (!$user->hasRequiredRole(['System Admin'])) {
            if (!$user->teams()->where('teams.team_id', $teamId)->exists()) {
                return response()->json(['error' => 'Unauthenticated or team not found.'], 401);
            }
    
            if (!$user->hasRequiredRole(['Team Manager'])) {
                return response()->json(['error' => 'You don\'t have the required role to add members to this team.'], 403);
            }
    
            if (!$user->hasPermission('team_member_management')) {
                return response()->json(['error' => 'You don\'t have permission to add members to this team.'], 403);
            }
        }
    
        $this->validate($request, [
            'user_name' => 'required|string',
        ]);
    
        $userAdd = User::where('username', $request->input('user_name'))->first();
        if($userAdd == null){
            return response()->json(['error' => 'User not found.'], 404);
        }
    
        $existingTeamMember = TeamMember::where('team_id', $teamId)
            ->where('user_id', $userAdd->user_id)
            ->first();
    
        if ($existingTeamMember) {
            return response()->json(['error' => 'User is already a member of the team.'], 400);
        }
    
        $teamMember = TeamMember::create([
            'team_id' => $teamId,
            'user_id' => $userAdd->user_id,
        ]);
    
        return response()->json(['message' => 'Team member added successfully.']);
    }
    
    public function destroyTeamMember($teamId, $userId)
    {
        $user = auth()->user();
        
        if ($user->user_id == $userId) {
            return response()->json(['error' => 'You cannot remove yourself from the team.'], 403);
        }
        
        if (!$user->hasRequiredRole(['System Admin'])) {
            if (!$user->teams()->where('teams.team_id', $teamId)->exists()) {
                return response()->json(['error' => 'Unauthenticated or team not found.'], 401);
            }
    
            if (!$user->hasRequiredRole(['Team Manager'])) {
                return response()->json(['error' => 'You don\'t have the required role to remove members from this team.'], 403);
            }

            if (!$user->hasPermission('team_member_management')) {
                return response()->json(['error' => 'You don\'t have permission to remove members from this team.'], 403);
            }
        }
    
        $teamMember = TeamMember::where('team_id', $teamId)
            ->where('user_id', $userId)
            ->first();
    
        if ($teamMember) {
            $teamMember->delete();
            return response()->json(['message' => 'Team member removed from the team successfully.']);
        } else {
            return response()->json(['error' => 'Team member not found in the team.'], 404);
        }
    }    
}
