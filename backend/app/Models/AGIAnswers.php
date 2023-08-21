<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AGIAnswers extends Model
{
    use HasFactory;

    protected $table = 'agi_answers';
    protected $primaryKey = 'agi_answer_id';

    protected $fillable = [
        'answer',
        'board_id',
        'task_id',
        'column_id',
    ];
}
