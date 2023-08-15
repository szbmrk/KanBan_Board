<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Role;
use Illuminate\Support\Facades\DB;
use App\Models\Board;
use App\Models\Team;
use Illuminate\Support\Facades\Validator;
class RoleController extends Controller
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

        $teamMemberIds = $user->teams->flatMap(function ($team) use ($boardId) {
            return $team->teamMembers->pluck('team_members_id');
        });
        if (!$board->team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }
    
        $roles = Role::whereIn('role_id', function ($query) use ($teamMemberIds) {
            $query->select('role_id')
                ->from('team_members_role')
                ->whereIn('team_member_id', $teamMemberIds);
        })
        ->where('board_id', $boardId)
        ->get();
    
        if ($roles->isEmpty()) {
            return response()->json(['error' => 'No roles found'], 404);
        }
    
        return response()->json(['roles' => $roles]);
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

        if ($user->hasRequiredRole(['System Admin'])) {
        } else {
            if (!$board->team->teamMembers->contains('user_id', $user->user_id)) {
                return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
            }
    
            if (!$user->hasRequiredRole(['Board Manager'])) {
                return response()->json(['error' => 'You don\'t have the required role to create a new role on this board.'], 403);
            }
            
            if (!$user->hasPermission('role_management')) {
                return response()->json(['error' => 'You don\'t have permission to create a new role on this board.'], 403);
            }
        }
    
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|min:1',
        ], [
            'name.required' => 'The name field is required.',
            'name.min' => 'The name must be at least 1 character.',
        ]);
    
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }
    
        $existingRole = Role::where('board_id', $boardId)
                            ->where('name', $request->input('name'))
                            ->first();
        
        if ($existingRole) {
            return response()->json(['error' => 'Role already exists for this board.'], 400);
        }
    
        $role = new Role();
        $role->name = $request->input('name');
        $role->board_id = $boardId;
        $role->save();
    
        return response()->json(['message' => 'Role created successfully'], 201);
    }
    
    public function update(Request $request, $boardId, $roleId)
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

        $role = Role::where('board_id', $boardId)
                    ->where('role_id', $roleId)
                    ->first();

        if (!$role) {
            return response()->json(['error' => 'Role not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|min:1',
        ], [
            'name.required' => 'The name field is required.',
            'name.min' => 'The name must be at least 1 character.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }
        

        if ($role->name == $request->input('name')) {
            return response()->json(['error' => 'Role name is already the same.'], 400);
        }

        $existingRole = Role::where('board_id', $boardId)
                            ->where('name', $request->input('name'))
                            ->where('role_id', '<>', $roleId)
                            ->first();
        
        if ($existingRole) {
            return response()->json(['error' => 'Role name already exists for this board.'], 400);
        }

        $role->name = $request->input('name');
        $role->save();

        return response()->json(['message' => 'Role updated successfully'], 200);
    }

    public function destroy($boardId, $roleId)
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

        $role = Role::where('board_id', $boardId)
                    ->where('role_id', $roleId)
                    ->first();

        if (!$role) {
            return response()->json(['error' => 'Role not found'], 404);
        }

        $role->delete();

        return response()->json(['message' => 'Role deleted successfully'], 200);
    }
}
