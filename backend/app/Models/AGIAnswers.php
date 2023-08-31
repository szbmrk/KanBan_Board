<?php

namespace App\Models;

use App\Models\User;
use App\Models\Board;
use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Model;
use App\Traits\AdjustTimestampsForHungaryTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AGIAnswers extends Model
{
    use HasFactory;
    use AdjustTimestampsForHungaryTrait;

    protected $table = 'agi_answers';
    protected $primaryKey = 'agi_answer_id';

    protected $fillable = [
        'chosenAI',
        'codeReviewOrDocumentationType',
        'codeReviewOrDocumentation',
        'codeReviewOrDocumentationText',
        'taskDocumentation',
        'taskDocumentationText',
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
