<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Column extends Model
{
    use HasFactory;

    protected $primaryKey = 'column_id';

    protected $fillable = [
        'name',
        'position',
        'board_id',
        'is_finished',
        'task_limit',
    ];

    // Relationship with the Board model
    public function board()
    {
        return $this->belongsTo(Board::class, 'board_id', 'board_id');
    }

    // Relationship with the Task model
    public function tasks()
    {
        return $this->hasMany(Task::class, 'column_id', 'column_id');
    }
}
