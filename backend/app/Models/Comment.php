<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;

    protected $primaryKey = 'comment_id';

    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id');
    }

    public function mentions()
    {
        return $this->hasMany(Mention::class, 'comment_id');
    }
}
