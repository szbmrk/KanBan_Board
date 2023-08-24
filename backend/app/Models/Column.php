<?php

namespace App\Models;

use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Column extends Model
{
    use HasFactory;
    use AdjustTimestampsForHungaryTrait;

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
        return $this->hasMany(Task::class, 'column_id', 'column_id')->where('parent_task_id', null);
    }
}