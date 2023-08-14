<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasApiTokens, Notifiable;

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

    public function favouriteTasks()
    {
        return $this->hasMany(FavouriteTask::class, 'user_id'); 
    }

    public function teamMembers()
    {
        return $this->hasMany(TeamMember::class, 'user_id', 'user_id');
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'team_members_role', 'team_member_id', 'role_id')
            ->using(TeamMemberRole::class)
            ->withPivot('team_member_id', 'role_id'); 
    }

    public function hasRequiredRole($requiredRoles)
    {
        $roles = $this->teamMembers->flatMap->roles;
        foreach ($roles as $role) {
            if (in_array($role->name, $requiredRoles)) {
                return true;
            }
        }
        return false;
    }
    
    
    public function hasPermission($permission)
    {
        foreach ($this->roles as $role) {
            if ($role->permissions->contains('name', $permission)) {
                return true;
            }
        }
        return false;
    }
}
