<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $primaryKey = 'task_id';
    protected $fillable = [
        'title',
        'description',
        'due_date',
        'column_id',
        'project_id',
        'priority_id',
        'parent_task_id',
        'position',
    ];

    // Relationship with the Column model
    public function column()
    {
        return $this->belongsTo(Column::class, 'column_id', 'column_id');
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
}
