<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attachment extends Model
{
    use HasFactory;

    protected $primaryKey = 'attachment_id';

    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id');
    }
}
