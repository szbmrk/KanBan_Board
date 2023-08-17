<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CraftedPrompt extends Model
{
    protected $primaryKey = 'crafted_prompt_id'; // Set the primary key field name
    protected $fillable = [
        'board_id', 'crafted_prompt_text', 'craft_with', 'created_by'
    ];

    public function board()
    {
        return $this->belongsTo(Board::class, 'board_id', 'board_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by', 'user_id');
    }
}
