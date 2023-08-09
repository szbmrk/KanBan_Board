<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserTask extends Model
{

    protected $fillable = ['user_id', 'task_id'];
    protected $table = 'user_tasks';
    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id');
    }

    public function priority()
    {
        return $this->belongsTo(Priority::class, 'priority_id', 'priority_id');
    }

    public function comments()
    {
        return $this->hasManyThrough(
            Comment::class,
            Task::class,
            'task_id',       // Foreign key on the Task table
            'task_id',       // Foreign key on the Comment table
            'task_id',       // Local key on the UserTask table
            'task_id'        // Local key on the Task table
        );
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'task_tags', 'task_id', 'tag_id');
    }
    
    public function attachments()
    {
        return $this->hasMany(Attachment::class, 'task_id');
    }
}
