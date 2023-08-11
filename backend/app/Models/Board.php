<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Board extends Model
{
    use HasFactory;

    protected $primaryKey = 'board_id';

    protected $fillable = [
        'name',
        'team_id',
    ];

    // Relationship with the Column model
    public function columns()
    {
        return $this->hasMany(Column::class, 'board_id', 'board_id');
    }

    public function team()
    {
        return $this->belongsTo(Team::class, 'team_id', 'team_id');
    }

    public function tags()
    {
        return $this->hasMany(Tag::class, 'board_id', 'board_id');
    }
    
    public function users()
    {
        return $this->belongsToMany(User::class, 'team_members', 'team_id', 'user_id');
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function roles()
    {
        return $this->hasMany(Role::class, 'board_id', 'board_id');
    }
}
