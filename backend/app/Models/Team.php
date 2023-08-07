<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    use HasFactory;

    protected $primaryKey = 'team_id';

    protected $fillable = [
        'name',
        'parent_team_id',
        'created_by',
    ];

    // Define a one-to-many relationship with TeamMember model
    public function teamMembers()
    {
        return $this->hasMany(TeamMember::class, 'team_id');
    }

    // Define a self-referential relationship for parent team
    public function parentTeam()
    {
        return $this->belongsTo(Team::class, 'parent_team_id', 'team_id');
    }

    // Define a self-referential relationship for child teams
    public function childTeams()
    {
        return $this->hasMany(Team::class, 'parent_team_id', 'team_id');
    }

    // Define a many-to-one relationship with User model for the team creator
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by', 'user_id');
    }
    public function boards()
    {
        return $this->hasMany(Board::class, 'team_id');
    }

    public function findTeamIdByBoardId($boardId)
    {
        $board = Board::find($boardId);
        if ($board) {
            return $board->team->team_id;
        } else {
            return null; // or you can throw an exception or handle the case when the board is not found
        }
    }

    // Other model code...
}
