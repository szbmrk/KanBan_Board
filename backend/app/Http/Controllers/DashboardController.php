<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\Team;
use App\Models\User;
use App\Models\Board;
use App\Models\TeamMember;
use App\Models\Role;
use App\Models\Permission;
use App\Helpers\LogRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use App\Helpers\ExecutePythonScript;
use function app\Helpers\ExecutePythonScript\executePythonScript;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use App\Events\BoardChange;
use App\Events\DashboardChange;
use Illuminate\Support\Facades\Event;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\NotificationType;


class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $teams = $user->teams()->with('boards')->get();
        //$response = ExecutePythonScript::instance()->Run();

        return response()->json([
            'teams' => $teams,
            //'response' => $response,
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();

        $team_id = $request->team_id;
        if ($user->teams()->where('teams.team_id', $team_id)->exists()) {

            $board = new Board;
            $board->name = $request->name;
            $board->team_id = $team_id;
            $board->save();

            $boardManagerRole = Role::firstOrCreate(['name' => 'Board Manager', 'board_id' => $board->board_id]);

            $teamMember = TeamMember::where('user_id', $user->user_id)->where('team_id', $team_id)->first();
            if ($teamMember) {
                $teamMember->roles()->attach($boardManagerRole->role_id);
            }

            $boardManagementPermission = Permission::firstOrCreate(['name' => 'board_management']);
            $roleManagementPermission = Permission::firstOrCreate(['name' => 'role_management']);
            $teamMemberRoleManagementPermission = Permission::firstOrCreate(['name' => 'team_member_role_management']);
            $columnManagementPermission = Permission::firstOrCreate(['name' => 'column_management']);
            $rolesPermissionsManagementPermission = Permission::firstOrCreate(['name' => 'roles_permissions_management']);
            $taskManagementPermission = Permission::firstOrCreate(['name' => 'task_management']);

            if (!$boardManagerRole->permissions->contains($boardManagementPermission)) {
                $boardManagerRole->permissions()->attach($boardManagementPermission->id);
            }

            if (!$boardManagerRole->permissions->contains($roleManagementPermission)) {
                $boardManagerRole->permissions()->attach($roleManagementPermission->id);
            }

            if (!$boardManagerRole->permissions->contains($teamMemberRoleManagementPermission)) {
                $boardManagerRole->permissions()->attach($teamMemberRoleManagementPermission->id);
            }

            if (!$boardManagerRole->permissions->contains($columnManagementPermission)) {
                $boardManagerRole->permissions()->attach($columnManagementPermission->id);
            }

            if (!$boardManagerRole->permissions->contains($rolesPermissionsManagementPermission)) {
                $boardManagerRole->permissions()->attach($rolesPermissionsManagementPermission->id);
            }

            if (!$boardManagerRole->permissions->contains($taskManagementPermission)) {
                $boardManagerRole->permissions()->attach($taskManagementPermission->id);
            }

            $user_ids = TeamMember::where('team_id', $board->team_id)
                ->distinct()
                ->pluck('user_id')
                ->toArray();

            $data = [
                'board' => $board
            ];

            foreach ($user_ids as $user_id) {
                broadcast(new DashboardChange($user_id, "CREATED_BOARD", $data));
            }

            LogRequest::instance()->logAction('CREATED BOARD', $user->user_id, "Created a BOARD named: '$board->name'", $team_id, $board->board_id, null);

            return response()->json(['board' => $board], 201);

        } else {
            LogRequest::instance()->logAction('NO PERMISSION', $user->user_id, "User does not belong to this team. -> Create Board", null, null, null);
            return response()->json(['error' => 'User does not belong to this team.'], 403);
        }
    }

    public function update(Request $request, $board_id)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }

        $board = Board::find($board_id);
        $old_board_name = $board->name;
        if (!$board) {
            LogRequest::instance()->logAction('BOARD NOT FOUND', $user->user_id, "Board not found on update -> board_id: $board_id", null, null, null);
            return response()->json(['error' => 'Board not found.'], 404);
        }

        if ($user->teams()->where('teams.team_id', $board->team_id)->exists()) {

            $roles = $user->getRoles();
            $permissions = $user->getPermissions();

            $boardManagerRoles = array_filter($roles, function ($role) use ($board_id) {
                return $role['name'] == 'Board Manager' && $role['board_id'] == $board_id;
            });

            if (in_array('system_admin', $permissions) || !empty($boardManagerRoles)) {
                $board->name = $request->name;
                $board->save();
                LogRequest::instance()->logAction('UPDATED BOARD', $user->user_id, "Changed the BOARD named '$old_board_name' to '$board->name'", $board->team_id, $board_id, null);

                $user_ids = TeamMember::whereIn('user_id', function ($query) use ($board_id) {
                    $query->select('user_id')
                        ->from('boards')
                        ->join('team_members', 'boards.team_id', '=', 'team_members.team_id')
                        ->where('boards.board_id', $board_id);
                })->distinct()->pluck('user_id')->toArray();

                $data = [
                    'board' => $board
                ];

                foreach ($user_ids as $user_id) {
                    broadcast(new DashboardChange($user_id, "UPDATED_BOARD", $data));
                    NotificationController::createNotification(NotificationType::BOARD, "A board you are member of got renamed from " . $old_board_name . " to " . $request->name, $user_id);
                }

                $data = [
                    'name' => $board->name
                ];
                broadcast(new BoardChange($board_id, "UPDATED_BOARD_NAME", $data));

                return response()->json(['board' => $board]);
            }
        }

        LogRequest::instance()->logAction('NO PERMISSION', $user->user_id, "User does not have permission to Update Board", null, null, null);
        return response()->json(['error' => 'You don\'t have permission to update this board.'], 401);
    }

    public function destroy($board_id)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }

        $board = Board::find($board_id);
        if (!$board) {
            LogRequest::instance()->logAction('BOARD NOT FOUND', $user->user_id, "Board not found on Delete. -> board_id: $board_id", null, null, null);
            return response()->json(['error' => 'Board not found.'], 404);
        }

        if ($user->teams()->where('teams.team_id', $board->team_id)->exists()) {
            $roles = $user->getRoles();
            $permissions = $user->getPermissions();

            $hasSystemAdminPermission = in_array('system_admin', $permissions);
            $hasBoardManagerRole = array_filter($roles, function ($role) use ($board_id) {
                return $role['name'] == 'Board Manager' && $role['board_id'] == $board_id;
            });

            if ($hasSystemAdminPermission || !empty($hasBoardManagerRole)) {
                $user_ids = TeamMember::where('team_id', $board->team_id)
                    ->distinct()
                    ->pluck('user_id')
                    ->toArray();

                $board->delete();

                $data = [
                    'board' => $board
                ];

                foreach ($user_ids as $user_id) {
                    broadcast(new DashboardChange($user_id, "DELETED_BOARD", $data));
                }

                LogRequest::instance()->logAction('DELETED BOARD', $user->user_id, "Deleted a BOARD named: '$board->name'", $board->team_id, $board_id, null);
                return response()->json(['message' => 'Board successfully deleted'], 200);
            }
        }

        return response()->json(['error' => "You don't have permission to delete this board."], 401);
    }

}