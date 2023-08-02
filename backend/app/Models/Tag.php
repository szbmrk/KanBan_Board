<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    use HasFactory;
    protected $primaryKey = 'tag_id';
    protected $fillable = ['name', 'color', 'created_by'];

    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($tag) {
            $tag->tasks()->detach();
        });
    }

    public function tasks()
    {
        return $this->belongsToMany(Task::class, 'task_tags', 'tag_id', 'task_id');
    }

    public function board()
    {
        return $this->belongsTo(Board::class, 'board_id', 'board_id');
    }

}
