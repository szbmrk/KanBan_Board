<?php

namespace App\Models;

use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Model;
use App\Traits\AdjustTimestampsForHungaryTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Task extends Model
{
    use HasFactory;
    use AdjustTimestampsForHungaryTrait;

    protected $primaryKey = 'task_id';
    protected $fillable = [
        'title',
        'description',
        'due_date',
        'board_id',
        'column_id',
        'project_id',
        'priority_id',
        'parent_task_id',
        'position',
    ];

    protected $appends = ['is_favourite'];
    public function getIsFavouriteAttribute()
    {
        // Check if this task is a favourite for the authenticated user

        return FavouriteTask::where('task_id', $this->task_id)->where('user_id', auth()->id())->exists();
    }
    // Relationship with the Column model
    public function column()
    {
        return $this->belongsTo(Column::class, 'column_id', 'column_id');
    }

    public function board()
    {
        return $this->belongsTo(Board::class);
    }

    // Relationship with the Parent Task (self-referencing)
    public function parentTask()
    {
        return $this->belongsTo(Task::class, 'parent_task_id', 'task_id');
    }

    // Relationship with the Priority model
    public function priority()
    {
        return $this->belongsTo(Priority::class, 'priority_id', 'priority_id');
    }

    public function attachments()
    {
        return $this->hasMany(Attachment::class, 'task_id');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class, 'task_id')->with('user');
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'task_tags', 'task_id', 'tag_id');
    }

    public function feedback()
    {
        return $this->hasMany(Feedback::class, 'task_id');
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'user_tasks', 'task_id', 'user_id');
    }

    public function subtasks()
    {
        return $this->hasMany(Task::class, 'parent_task_id', 'task_id')->with(['subtasks', 'tags', 'comments', 'priority', 'attachments', 'members']);
    }
}