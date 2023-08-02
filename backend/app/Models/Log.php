<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    protected $primaryKey = 'log_id';
    protected $fillable = ['action', 'user_id', 'details', 'task_id', 'board_id', 'team_id', 'created_at'];
    protected $casts = ['details' => 'array'];

    // Define the relationships with other models

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id', 'task_id');
    }

    public function board()
    {
        return $this->belongsTo(Board::class, 'board_id', 'board_id');
    }

    public function team()
    {
        return $this->belongsTo(Team::class, 'team_id', 'team_id');
    }
}
