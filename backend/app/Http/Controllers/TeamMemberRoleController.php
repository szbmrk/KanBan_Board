<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TeamMemberRole;
use App\Models\Board;
use App\Models\Role;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Support\Facades\DB;

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
        
        $rolesOnBoard = $user->getRoles($boardId);
        $hasRoleManagementPermission = collect($rolesOnBoard)->contains(function($role) {
            return in_array('team_member_role_management', $role->permissions->pluck('name')->toArray());
        });
        
        if (!$hasRoleManagementPermission) {
            return response()->json(['error' => 'You don\'t have permission to manage team member roles on this board.'], 403);
        }
        
        $allRoles = Role::where('board_id', $boardId)->get(); // Módosított lekérdezés
        
        return response()->json(['roles' => $allRoles]);
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

        $permissions = $user->getPermissions();

        if (!in_array('system_admin', $permissions)) {
            if (!$board->team->teamMembers->contains('user_id', $user->user_id)) {
                return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
            }
            
            $rolesOnBoard = $user->getRoles($boardId);
    
            $hasRoleManagementPermission = collect($rolesOnBoard)->contains(function($role) {
                return in_array('team_member_role_management', $role->permissions->pluck('name')->toArray());
            });
    
            if (!$hasRoleManagementPermission) {
                return response()->json(['error' => 'You don\'t have permission to create a new role on this board.'], 403);
            }
        }

        if (!$board->team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $teamMemberId = $request->input('team_member_id');
        $teamMember = TeamMember::where('team_members_id', $teamMemberId)->first();

        if (!$teamMember) {
            return response()->json(['error' => 'Team member not found'], 404);
        }

        $roleId = $request->input('role_id');
        $roleExists = Role::where('role_id', $roleId)->exists();
        if (!$roleExists) {
            return response()->json(['error' => 'Role not found'], 404);
        }

        if ($teamMember->team_id !== $board->team_id) {
            return response()->json(['error' => 'The selected team member is not part of the team that owns this board.'], 403);
        }

        $existingEntry = TeamMemberRole::where('team_member_id', $teamMember->team_members_id)
                                        ->where('role_id', $roleId)
                                        ->first();
        if ($existingEntry) {
        return response()->json(['error' => 'An entry with the same team member and role already exists.'], 400);
        }

        $teamMemberRole = new TeamMemberRole();
        $teamMemberRole->team_member_id = $teamMember->team_members_id;
        $teamMemberRole->role_id = $roleId;
        $teamMemberRole->save();

        return response()->json(['message' => 'Role assigned successfully']);
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
    
            $permissions = $user->getPermissions();
    
            if (!in_array('system_admin', $permissions)) {
                if (!$board->team->teamMembers->contains('user_id', $user->user_id)) {
                    return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
                }
    
                $rolesOnBoard = $user->getRoles($boardId);
                
                // Check if the user has the necessary permission for role management
                $hasRoleManagementPermission = collect($rolesOnBoard)->contains(function($role) {
                    return in_array('team_member_role_management', $role->permissions->pluck('name')->toArray());
                });
    
                if (!$hasRoleManagementPermission) {
                    return response()->json(['error' => 'You don\'t have permission to delete a role on this board.'], 403);
                }
            }
    
            $teamMemberRole = TeamMemberRole::find($teamMemberRoleId);
            if (!$teamMemberRole) {
                return response()->json(['error' => 'Team member role not found'], 404);
            }
    
            $roleExists = Role::where('role_id', $teamMemberRole->role_id)->exists();
            if (!$roleExists) {
                return response()->json(['error' => 'Role not found'], 404);
            }
    
            $teamMember = TeamMember::where('user_id', $teamMemberRole->teamMember->user_id)
                ->where('team_id', $board->team_id)
                ->first();
    
            if (!$teamMember) {
                return response()->json(['error' => 'The selected team member is not part of the team that owns this board.'], 403);
            }
    
            $teamMemberRole->delete();
    
            return response()->json(['message' => 'Team member role deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred'], 500);
        }
    }
    

}