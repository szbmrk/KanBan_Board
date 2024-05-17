<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;
use App\Models\TeamMemberRole;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\NotificationType;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use App\Events\TeamChange;
use App\Events\DashboardChange;
use Illuminate\Support\Facades\Event;

use Illuminate\Http\Request;

class TeamManagementController extends Controller
{
    public function show($id)
    {
        $user = auth()->user();
    
        if ($user->teams()->where('teams.team_id', $id)->exists()) {
            $team = Team::with(['teamMembers.user.roles.permissions', 'teamMembers.roles.permissions'])
                ->findOrFail($id);
    
            return response()->json(['team' => $team]);
        } else {
            return response()->json(['error' => 'Unauthenticated or team not found.'], 401);
        }
    }

    public function storeTeamMember(Request $request, $team_id)
    {
        $user = auth()->user();

        if (!$user->hasPermission('system_admin')) {
            if (!$user->teams()->where('teams.team_id', $team_id)->exists()) {
                return response()->json(['error' => 'Unauthenticated or team not found.'], 401);
            }

            if (!$user->hasPermission('team_member_management')) {
                return response()->json(['error' => 'You don\'t have permission to add members to this team.'], 403);
            }
        }
        
        if (!$user->teams()->where('teams.team_id', $team_id)->exists()) {
            return response()->json(['error' => 'Unauthenticated or team not found.'], 401);
        }
        
        $userIds = $request->input('user_ids', []);
        
        $team = Team::with(['teamMembers.user'])->findOrFail($team_id);
        $currentMemberIds = $team->teamMembers->pluck('user_id')->toArray();
        
        $addedMembers = [];
    
        foreach ($userIds as $userId) {
            if (in_array($userId, $currentMemberIds)) {
                continue;
            }
            
            $teamMember = new TeamMember();
            $teamMember->team_id = $team_id;
            $teamMember->user_id = $userId;
            $teamMember->save();
            $newTeamMember=TeamMember::with(["user", "roles.permissions"])->where('team_id', $team_id)
            ->where('user_id', $userId)
            ->first();
            
            foreach ($newTeamMember->roles as &$role) {
                // Kérdezd le a team_members_role_id-t a megfelelő kritériumok alapján
                $teamMembersRoleId = TeamMemberRole::where('team_member_id', $newTeamMember->team_members_id)
                                                   ->where('role_id', $role->role_id)
                                                   ->value('team_members_role_id');
    
                // Ha találtál értéket, adjuk hozzá a szerephez
                if ($teamMembersRoleId !== null) {
                    $role->team_members_role_id = $teamMembersRoleId;
                }
            }

            $team = Team::with(['teamMembers.user', 'teamMembers.roles'])->findOrFail($team_id);
            $data = [
                'team' => $team
            ];
  
            broadcast(new TeamChange($userId, "THIS_USER_ADDED_TO_TEAM", $data));

            $user_ids = TeamMember::where('team_id', $team->team_id)
                ->Where('user_id', '!=', $userId)
                ->distinct()
                ->pluck('user_id')
                ->toArray();
            $data = [
                'team' => $team,
                'user' => $newTeamMember
            ];
            foreach ($user_ids as $user_id) {
                broadcast(new TeamChange($user_id, "USER_ADDED_TO_TEAM", $data));
            }

            $team = Team::with(['boards'])->findOrFail($team_id);
            $data = [
                'team' => $team
            ];
            broadcast(new DashboardChange($userId, "THIS_USER_ADDED_TO_TEAM", $data));

            NotificationController::createNotification(NotificationType::TEAM, "You are added to the following team: ".$team->name, $userId);

            $addedMembers[] = $newTeamMember;
        }
    
        if (!empty($addedMembers)) {
            return response()->json(['message' => 'Members added successfully.', 'added_members' => $addedMembers]);
        } else {
            return response()->json(['message' => 'No new members added.']);
        }
    }
    
    public function destroyTeamMember($teamId, $userId)
    {
        $user = auth()->user();
    
        if ($user->user_id == $userId) {
            return response()->json(['error' => 'You cannot remove yourself from the team.'], 403);
        }
        
        if (!$user->hasPermission('system_admin')) {
            if (!$user->teams()->where('teams.team_id', $teamId)->exists()) {
                return response()->json(['error' => 'Unauthenticated or team not found.'], 401);
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

            $team = Team::find($teamId);

            $data = [
                'team' => $team
            ];
            broadcast(new TeamChange($userId, "THIS_USER_DELETED_FROM_TEAM", $data));

            $user_ids = TeamMember::where('team_id', $team->team_id)
                ->Where('user_id', '!=', $userId)
                ->distinct()
                ->pluck('user_id')
                ->toArray();
            $data = [
                'team' => $team,
                'user' => $teamMember
            ];
            foreach ($user_ids as $user_id) {
                broadcast(new TeamChange($user_id, "USER_DELETED_FROM_TEAM", $data));
            }

            $data = [
                'team' => $team
            ];
            broadcast(new DashboardChange($teamMember->user_id, "THIS_USER_DELETED_FROM_TEAM", $data));
  
            NotificationController::createNotification(NotificationType::TEAM, "You are removed from the following team: ".$team->name, $userId);

            return response()->json(['message' => 'Team member removed from the team successfully.']);
        } else {
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
    
        if ($currentUser->id !== $user->id) {
            return response()->json(['error' => 'Unauthorized.'], 403);
        }

        $teams = $user->teams()->with(['teamMembers.user', 'teamMembers.roles.permissions', 'teamMembers.roles.board'])->get();

        foreach ($teams as &$team) {
            foreach ($team->teamMembers as &$member) {
                foreach ($member->roles as &$role) {
                    // Kérdezd le a team_members_role_id-t a megfelelő kritériumok alapján
                    $teamMembersRoleId = TeamMemberRole::where('team_member_id', $member->team_members_id)
                                                       ->where('role_id', $role->role_id)
                                                       ->value('team_members_role_id');
        
                    // Ha találtál értéket, adjuk hozzá a szerephez
                    if ($teamMembersRoleId !== null) {
                        $role->team_members_role_id = $teamMembersRoleId;
                    }
                }
            }
        }
        
        // Módosított válasz létrehozása és visszaadása
        $response = ['teams' => $teams];
        return response()->json($response);
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
