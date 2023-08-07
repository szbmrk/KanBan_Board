<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    use HasFactory;

    protected $table = 'feedbacks';

    protected $primaryKey = 'feedback_id';

    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id'); 
    }

    public function board()
    {
        return $this->belongsTo(Board::class, 'board_id'); 
    }

    public function user() {
        return $this->belongsTo(User::class);
    }
}
