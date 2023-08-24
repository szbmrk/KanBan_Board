<?php

namespace App\Models;

use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Model;
use App\Traits\AdjustTimestampsForHungaryTrait;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TeamMemberRole extends Pivot
{
    use HasFactory;
    use AdjustTimestampsForHungaryTrait;

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
