<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Board;

class AGIAnswers extends Model
{
    use HasFactory;

    protected $table = 'agi_answers';
    protected $primaryKey = 'agi_answer_id';

    protected $fillable = [
        'codeReviewOrDocumentationType',
        'codeReviewOrDocumentation',
        'taskDocumentation',
        'board_id',
        'task_id',
        'column_id',
        'user_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id'); // Kapcsolat a users táblához
    }
    public function board()
    {
        return $this->belongsTo(Board::class, 'board_id'); // Kapcsolat a boards táblához
    }
}
