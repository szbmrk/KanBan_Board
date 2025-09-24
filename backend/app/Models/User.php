<?php

namespace App\Models;

use Illuminate\Support\Carbon;
use Laravel\Sanctum\HasApiTokens;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\AdjustTimestampsForHungaryTrait;
use Illuminate\Foundation\Auth\User as Authenticatable;
use App\Notifications\CustomResetPasswordNotification;
use App\Notifications\CustomVerifyEmailNotification;
use Illuminate\Contracts\Auth\MustVerifyEmail;

class User extends Authenticatable implements JWTSubject, MustVerifyEmail
{
    use HasApiTokens, Notifiable, SoftDeletes;
    use AdjustTimestampsForHungaryTrait;

    protected $primaryKey = 'user_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'username',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    public function teams()
    {
        return $this->belongsToMany(Team::class, 'team_members', 'user_id', 'team_id');
    }

    public function isMemberOfBoard($board_id)
    {
        if ($this->hasPermission('system_admin')) {
            return true;
        }
        // Check if the user's teams have the specified board
        return $this->teams()->whereHas('boards', function ($query) use ($board_id) {
            $query->where('board_id', $board_id);
        })->exists();
    }

    public function boards()
    {
        return $this->belongsToMany(Board::class, 'team_members', 'user_id', 'team_id');
    }

    public function mentions()
    {
        return $this->hasMany(Mention::class);
    }

    public function feedback()
    {
        return $this->hasMany(Feedback::class, 'task_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'user_id');
    }

    public function userTasks()
    {
        return $this->hasMany(UserTask::class, 'user_id');
    }

    public function favouriteTasks()
    {
        return $this->hasMany(FavouriteTask::class, 'user_id');
    }

    public function favouriteBoards()
    {
        return $this->hasMany(FavouriteBoard::class, 'user_id');
    }

    public function teamMembers()
    {
        return $this->hasMany(TeamMember::class, 'user_id', 'user_id');
    }

    public function markEmailAsVerified()
    {
        return $this->forceFill([
            'email_verified_at' => $this->freshTimestamp(),
        ])->save();
    }

    public function roles()
    {
        return $this->hasManyThrough(
            Role::class,
            TeamMemberRole::class,
            'team_member_id',
            'role_id',
            'user_id',
            'team_member_id'
        );
    }

    public function hasPermission($permission)
    {
        $allRoles = $this->teamMembers->flatMap->roles;

        foreach ($allRoles as $role) {
            if ($role->permissions->contains('name', $permission)) {
                return true;
            }
        }
        return false;
    }

    public function getRoles($boardId = null)
    {
        return $this->teamMembers->flatMap(function ($teamMember) use ($boardId) {
            return $teamMember->roles->filter(function ($role) use ($boardId) {
                return $boardId ? $role->board_id == $boardId : true;
            });
        })->unique('role_id')->values()->all();
    }

    public function getPermissions()
    {
        return $this->teamMembers->flatMap(function ($teamMember) {
            return $teamMember->roles->flatMap->permissions->pluck('name');
        })->unique()->all();
    }

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new CustomResetPasswordNotification($token, $this->email));
    }

    public function sendEmailVerificationNotification()
    {
        $this->notify(new CustomVerifyEmailNotification());
    }
}
