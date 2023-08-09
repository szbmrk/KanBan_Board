<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeamMember extends Model
{
    protected $primaryKey = 'team_members_id';

    protected $fillable = [
        'team_id', 'user_id',
    ];

    // Define a many-to-one relationship with Team model
    public function team()
    {
        return $this->belongsTo(Team::class, 'team_id');
    }

    // Define a many-to-one relationship with User model for the team member
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    

    public function roles()
    {
        return $this->hasManyThrough(Role::class, TeamMemberRole::class, 'team_member_id', 'role_id');
    }

    // Other model code...
}

