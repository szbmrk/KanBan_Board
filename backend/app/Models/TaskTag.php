<?php

namespace App\Models;

use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Model;
use App\Traits\AdjustTimestampsForHungaryTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TaskTag extends Model
{
    use HasFactory;
    use AdjustTimestampsForHungaryTrait;

    protected $table = 'task_tags';
    protected $primaryKey = 'task_tag_id';

    public function tag()
    {
        return $this->belongsTo(Tag::class, 'tag_id', 'tag_id');
    }

    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id', 'task_id');
    }
    
    public function board()
    {
        return $this->belongsTo(Board::class, 'board_id', 'board_id');
    }
}
