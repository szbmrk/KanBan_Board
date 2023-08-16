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

    public function storeTeamMember(Request $request, $team_id)
    {
        $user = auth()->user();
        
        // Check if the user belongs to the team
        if (!$user->teams()->where('teams.team_id', $team_id)->exists()) {
            return response()->json(['error' => 'Unauthenticated or team not found.'], 401);
        }
        
        $userIds = $request->input('user_ids', []);
        
        // Fetch the team and its current members
        $team = Team::with(['teamMembers.user'])->findOrFail($team_id);
        $currentMemberIds = $team->teamMembers->pluck('user_id')->toArray();
        
        $addedMembers = [];
    
        foreach ($userIds as $userId) {
            // Check if the user is already a member of the team
            if (in_array($userId, $currentMemberIds)) {
                continue; // Skip adding if already a member
            }
            
            // Add the user as a team member
            $teamMember = new TeamMember();
            $teamMember->team_id = $team_id;
            $teamMember->user_id = $userId;
            $teamMember->save();
            
            $addedMembers[] = TeamMember::with("user")->where('team_id', $team_id)
                ->where('user_id', $userId)
                ->first();
        }
    
        if (!empty($addedMembers)) {
            return response()->json(['message' => 'Members added successfully.', 'added_members' => $addedMembers]);
        } else {
            return response()->json(['message' => 'No new members added.']);
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

    public function teamsByUser($user_id)
    {
        $currentUser = auth()->user();

        if (!$currentUser) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }
    
        $user = User::findOrFail($user_id);
    
        // Check if the current user is the same as the requested user
        if ($currentUser->id !== $user->id) {
            return response()->json(['error' => 'Unauthorized.'], 403);
        }
    
        // Fetch teams associated with the user
        $teams = $user->teams()->with(['teamMembers.user'])->get();
    
        return response()->json(['teams' => $teams]);
    }

    public function showNotTeamMembers($teamId)
    {
        $user = auth()->user();

        //give back those users who are not in the team
        if ($user->teams()->where('teams.team_id', $teamId)->exists()) {
            $team = Team::with(['teamMembers.user'])->findOrFail($teamId);
            $users = User::whereNotIn('user_id', $team->teamMembers->pluck('user_id'))->get();
            return response()->json(['users' => $users]);
        } else {
            return response()->json(['error' => 'Unauthenticated or team not found.'], 401);
        }

    }
}
