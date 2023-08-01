<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mention extends Model
{
    use HasFactory;

    protected $primaryKey = 'mention_id';

    public function comment()
    {
        return $this->belongsTo(Comment::class, 'comment_id');
    }
}
