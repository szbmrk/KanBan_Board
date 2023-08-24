<?php

namespace App\Models;

use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Model;
use App\Traits\AdjustTimestampsForHungaryTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Attachment extends Model
{
    use HasFactory;
    use AdjustTimestampsForHungaryTrait;

    protected $primaryKey = 'attachment_id';

    protected $fillable = [
        'task_id',
        'link',
        'description',
        'created_at',
        'updated_at',
    ];


    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id');
    }
}
