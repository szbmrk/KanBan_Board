<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CraftedPrompt extends Model
{
    use HasFactory;

    protected $primaryKey = 'crafted_prompt_id'; // Define the primary key field name

    protected $fillable = [
        'crafted_prompt_title',
        'board_id',
        'agi_behavior_id',
        'crafted_prompt_text',
        'craft_with',
        'action',
        'response_counter',
        'created_by',
    ];

    // Define relationships with other tables (if any)
    
    // Define any additional model methods or attributes as needed
}
