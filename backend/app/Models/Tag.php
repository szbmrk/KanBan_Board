<?php

namespace App\Models;

use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Model;
use App\Traits\AdjustTimestampsForHungaryTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Tag extends Model
{
    use HasFactory;
    use AdjustTimestampsForHungaryTrait;

    protected $primaryKey = 'tag_id';
    protected $fillable = ['name', 'color', 'board_id', 'created_by'];

    public function tasks()
    {
        return $this->belongsToMany(Task::class, 'task_tags', 'tag_id', 'task_id');
    }

    public function board()
    {
        return $this->belongsTo(Board::class, 'board_id', 'board_id');
    }

}
