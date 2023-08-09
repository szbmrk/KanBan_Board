<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TeamMemberRole;
use App\Models\Board;
use App\Models\Role;
use App\Models\TeamMember;

class TeamMemberRoleController extends Controller
{
    
    public function index($boardId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        $board = Board::find($boardId);

        if (!$board) {
            return response()->json(['error' => 'Board not found'], 404);
        }

        if (!$board->team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $teamMemberRoles = TeamMemberRole::whereHas('teamMember.team', function ($query) use ($user, $boardId) {
            $query->where('user_id', $user->user_id)
                ->whereHas('boards', function ($subQuery) use ($boardId) {
                    $subQuery->where('board_id', $boardId);
                });
        })
        ->with(['role', 'teamMember'])
        ->get();

        if ($teamMemberRoles->isEmpty()) {
            return response()->json(['error' => 'No roles found'], 404);
        }

        return response()->json(['roles' => $teamMemberRoles]);
    }

    public function store(Request $request, $boardId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $board = Board::find($boardId);
        if (!$board) {
            return response()->json(['error' => 'Board not found'], 404);
        }

        if (!$board->team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $teamMember = TeamMember::where('user_id', $user->user_id)
            ->where('team_id', $board->team_id)
            ->first();

        if (!$teamMember) {
            return response()->json(['error' => 'You are not a team member of this board.'], 403);
        }
        $teamMemberId = $request->input('team_member_id');

        $teamMemberExists = TeamMember::where('team_members_id', $teamMemberId)->exists();
        if (!$teamMemberExists) {
            return response()->json(['error' => 'Team member not found'], 404);
        }

        $roleId = $request->input('role_id');

        $roleExists = Role::where('role_id', $roleId)->exists();
        if (!$roleExists) {
            return response()->json(['error' => 'Role not found'], 404);
        }
        

        $existingTeamMemberRole = TeamMemberRole::where('team_member_id', $teamMember->team_members_id)
            ->where('role_id', $roleId)
            ->exists();
        if ($existingTeamMemberRole) {
            return response()->json(['error' => 'Role already assigned to the user'], 400);
        }

        $teamMemberRole = new TeamMemberRole();
        $teamMemberRole->team_member_id = $teamMember->team_members_id;
        $teamMemberRole->role_id = $roleId;
        $teamMemberRole->save();

        return response()->json(['message' => 'Role assigned successfully']);
    }

    public function update2(Request $request, $boardId, $teamMemberRoleId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $board = Board::find($boardId);
        if (!$board) {
            return response()->json(['error' => 'Board not found'], 404);
        }

        if (!$board->team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $teamMember = TeamMember::where('user_id', $user->user_id)
            ->where('team_id', $board->team_id)
            ->first();

        if (!$teamMember) {
            return response()->json(['error' => 'You are not a team member of this board.'], 403);
        }

        $teamMemberRoleId = $request->input('team_member_role_id');
        $teamMemberRole = TeamMemberRole::find($teamMemberRoleId);

        if (!$teamMemberRole) {
            return response()->json(['error' => 'Team member role not found'], 404);
        }

        $role = Role::find($teamMemberRole->role_id);

        if (!$role) {
            return response()->json(['error' => 'Role not found'], 404);
        }

        $role->name = $request->input('name');
        $role->save();

        return response()->json(['message' => 'Role updated successfully'], 200);
    }


    public function update(Request $request, $boardId, $teamMemberRoleId)
    {
        try {
            $user = auth()->user();
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $board = Board::find($boardId);
            if (!$board) {
                return response()->json(['error' => 'Board not found'], 404);
            }

            if (!$board->team->teamMembers->contains('user_id', $user->user_id)) {
                return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
            }

            $teamMember = TeamMember::where('user_id', $user->user_id)
                ->where('team_id', $board->team_id)
                ->first();

            if (!$teamMember) {
                return response()->json(['error' => 'You are not a team member of this board.'], 403);
            }

            $teamMemberRole = TeamMemberRole::find($teamMemberRoleId);
            if (!$teamMemberRole) {
                return response()->json(['error' => 'Team member role not found'], 404);
            }

            $roleExists = Role::where('role_id', $request->input('role_id'))->exists();
            if (!$roleExists) {
                return response()->json(['error' => 'Role not found'], 404);
            }

            $teamMemberRole = TeamMemberRole::findOrFail($teamMemberRoleId);

            $teamMemberRole->role_id = $request->input('role_id');
            $teamMemberRole->save();

            return response()->json(['message' => 'Team member role updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred'], 500);
        }
    }

    public function destroy($boardId, $teamMemberRoleId)
    {
        try {
            $user = auth()->user();
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $board = Board::find($boardId);
            if (!$board) {
                return response()->json(['error' => 'Board not found'], 404);
            }

            if (!$board->team->teamMembers->contains('user_id', $user->user_id)) {
                return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
            }

            $teamMember = TeamMember::where('user_id', $user->user_id)
                ->where('team_id', $board->team_id)
                ->first();

            if (!$teamMember) {
                return response()->json(['error' => 'You are not a team member of this board.'], 403);
            }

            $teamMemberRole = TeamMemberRole::find($teamMemberRoleId);
            if (!$teamMemberRole) {
                return response()->json(['error' => 'Team member role not found'], 404);
            }

            // Ellenőrizzük, hogy létezik-e az adott role_id
            $roleExists = Role::where('role_id', $teamMemberRole->role_id)->exists();
            if (!$roleExists) {
                return response()->json(['error' => 'Role not found'], 404);
            }

            $teamMemberRole->delete();

            return response()->json(['message' => 'Team member role deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred'], 500);
        }
    }









    

}
