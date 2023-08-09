<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TeamMemberRole;
use App\Models\Board;
use App\Models\Role;

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






    

}
