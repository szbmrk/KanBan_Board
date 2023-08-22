<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Team;
use App\Helpers\LogRequest;
use App\Models\Role;
use App\Models\TeamMember;
use App\Models\Permission;
use Illuminate\Support\Facades\DB;

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

        $request->validate(['name' => 'required|string|max:255']);

        $team = new Team();
        $team->name = $request->input('name');
        $team->created_by = $user->user_id;
        $team->save();

        $teamManagerRole = Role::where('name', 'Team Manager')->first();
        $teamManagementPermission = Permission::where('name', 'team_management')->first();
        $teamMemberManagementPermission = Permission::where('name', 'team_member_management')->first();
      
        $teamMember = TeamMember::create([
            'team_id' => $team->team_id,
            'user_id' => $user->user_id,
        ]);

        $teamMember->roles()->attach($teamManagerRole->role_id);

        if (!$teamManagerRole->permissions->contains($teamManagementPermission)) {
            $teamManagerRole->permissions()->attach($teamManagementPermission->id);
        }

        if (!$teamManagerRole->permissions->contains($teamMemberManagementPermission)) {
            $teamManagerRole->permissions()->attach($teamMemberManagementPermission->id);
        }
        
        LogRequest::instance()->logAction('CREATED TEAM', $user->user_id, "Team Created successfully! -> $team->name", $team->team_id, null, null);
        $team=Team::with(['teamMembers.user.roles.permissions', 'teamMembers.roles.permissions'])->find($team->team_id);
        return response()->json(['message' => 'Team Created successfully!', 'team' => $team]);         
    }    
    
    public function update(Request $request, $id)
    {
        $user = auth()->user();

        $team = Team::find($id);

        if (!$team) {
            LogRequest::instance()->logAction('TEAM NOT FOUND', $user->user_id, "Team not found on Update. -> team_id: $id", null, null, null);
            return response()->json(['error' => 'Team not found'], 404);
        }

        if (!$user->hasPermission('system_admin')) {
            if (!$team->teamMembers->contains('user_id', $user->user_id)) {
                return response()->json(['error' => 'You are not a member of this team.'], 403);
            }

            if (!$user->hasPermission('team_management')) {
                LogRequest::instance()->logAction('NO PERMISSION', $user->user_id, "User does not have 'team_management' permission. -> Update Team", null, null, null);
                return response()->json(['error' => 'You don\'t have permission to update this team.'], 403);
            }
        }

        $request->validate([
            'name' => 'required|string|max:255',
        ]);

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
            return response()->json(['error' => 'Team not found'], 404);
        }

        if (!$user->hasPermission('system_admin')) {
            if (!$team->teamMembers->contains('user_id', $user->user_id)) {
                return response()->json(['error' => 'You are not a member of this team.'], 403);
            }

            if (!$user->hasPermission('team_management')) {
                LogRequest::instance()->logAction('NO PERMISSION', $user->user_id, "User does not have 'team_management' permission. -> Delete Team", null, null, null);
                return response()->json(['error' => 'You don\'t have permission to delete this team.'], 403);
            }
        }

        $team->delete();

        LogRequest::instance()->logAction('DELETED TEAM', $user->user_id, "Team Deleted successfully! -> team_id: $team->team_id, name: $team->name", null, null, null);

        return response()->json(['message' => 'Team deleted successfully']);
    }
}