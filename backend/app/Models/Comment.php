<?php

namespace App\Models;

use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Model;
use App\Traits\AdjustTimestampsForHungaryTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Comment extends Model
{
    use HasFactory;
    use AdjustTimestampsForHungaryTrait;

    protected $primaryKey = 'comment_id';

    protected $fillable = [
        'task_id',
        'user_id',
        'text',
    ];

    
    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id');
    }

    public function mentions()
    {
        return $this->hasMany(Mention::class, 'comment_id');
    }
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
