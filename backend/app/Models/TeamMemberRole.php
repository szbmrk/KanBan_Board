<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeamMemberRole extends Model
{
    use HasFactory;

    protected $primaryKey = 'team_members_role_id';
    protected $table = 'team_members_role';

    protected $fillable = [
        'team_member_id',
        'role_id',
    ];
    

    public function teamMember()
    {
        return $this->belongsTo(TeamMember::class, 'team_member_id', 'team_members_id');
    }

    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id', 'role_id');
    }
    
}
