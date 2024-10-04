<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Board;
use App\Models\Role;
use App\Models\Permission;


class RolePermissionController extends Controller
{
    public function index(Request $request, $boardId)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $board = Board::find($boardId);
        if (!$board) {
            return response()->json(['error' => 'Board not found'], 404);
        }

        if ($user->hasPermission('system_admin')) {
            $roles = Role::where('board_id', $boardId)->with('permissions')->get();
            return response()->json(['roles' => $roles]);
        }

        $isTeamMember = $board->team->teamMembers->contains('user_id', $user->user_id);
        $rolesOnBoard = $user->getRoles($boardId);
        $hasRoleManagementPermission = collect($rolesOnBoard)->contains(function ($role) {
            return in_array('roles_permissions_management', $role->permissions->pluck('name')->toArray());
        });

        $hasRoleTeam_Management = collect($rolesOnBoard)->contains(function ($role) {
            return in_array('team_management', $role->permissions->pluck('name')->toArray());
        });

        $hasRoleRole_Management = collect($rolesOnBoard)->contains(function ($role) {
            return in_array('role_management', $role->permissions->pluck('name')->toArray());
        });

        if (!$isTeamMember || (!$hasRoleTeam_Management && !$hasRoleManagementPermission && !$hasRoleRole_Management)) {
            return response()->json(['error' => 'You don\'t have permission to view role-permissions on this board.'], 403);
        }

        $roles = Role::where('board_id', $boardId)->with('permissions')->get();

        return response()->json(['roles' => $roles]);
    }

    public function getAllPermissions()
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $permissions = Permission::all();

        return response()->json(['permissions' => $permissions]);
    }

    public function store(Request $request, $boardId, $roleId)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $board = Board::find($boardId);
        if (!$board) {
            return response()->json(['error' => 'Board not found'], 404);
        }

        $isTeamMember = $board->team->teamMembers->contains('user_id', $user->user_id);
        $rolesOnBoard = $user->getRoles($boardId);
        $hasRoleManagementPermission = collect($rolesOnBoard)->contains(function ($role) {
            return in_array('roles_permissions_management', $role->permissions->pluck('name')->toArray());
        });

        if (!$isTeamMember || !$hasRoleManagementPermission) {
            return response()->json(['error' => 'You don\'t have permission to manage role-permissions on this board.'], 403);
        }

        $role = Role::where('board_id', $boardId)->where('role_id', $roleId)->first();
        if (!$role) {
            return response()->json(['error' => 'Role not found'], 404);
        }

        $permissionId = $request->input('permission_id');
        $permission = Permission::find($permissionId);
        if (!$permission) {
            return response()->json(['error' => 'Permission not found'], 404);
        }

        if ($role->permissions->contains($permissionId)) {
            return response()->json(['error' => 'This permission is already attached to the role.'], 400);
        }

        try {
            $role->permissions()->attach($permissionId);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while attaching the permission.'], 500);
        }

        return response()->json(['message' => 'Permission added to role successfully', 'permission' => $permission]);
    }

    public function destroy($boardId, $roleId, $permissionId)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $board = Board::find($boardId);
        if (!$board) {
            return response()->json(['error' => 'Board not found'], 404);
        }

        $isTeamMember = $board->team->teamMembers->contains('user_id', $user->user_id);
        $rolesOnBoard = $user->getRoles($boardId);
        $hasRoleManagementPermission = collect($rolesOnBoard)->contains(function ($role) {
            return in_array('roles_permissions_management', $role->permissions->pluck('name')->toArray());
        });

        if (!$isTeamMember || !$hasRoleManagementPermission) {
            return response()->json(['error' => 'You don\'t have permission to manage role-permissions on this board.'], 403);
        }

        $role = Role::where('board_id', $boardId)->where('role_id', $roleId)->first();
        if (!$role) {
            return response()->json(['error' => 'Role not found'], 404);
        }

        $permission = Permission::find($permissionId);
        if (!$permission) {
            return response()->json(['error' => 'Permission not found'], 404);
        }

        if (!$role->permissions->contains($permissionId)) {
            return response()->json(['error' => 'This permission is not attached to the role.'], 400);
        }

        try {
            $role->permissions()->detach($permissionId);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while detaching the permission.'], 500);
        }

        return response()->json(['message' => 'Permission removed from role successfully']);
    }
}
