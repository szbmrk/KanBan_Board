<?php

namespace App\Models;

use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Model;
use App\Traits\AdjustTimestampsForHungaryTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CraftedPrompt extends Model
{
    use HasFactory;
    use AdjustTimestampsForHungaryTrait;

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

    protected $appends = ['agiBehaviour'];
    protected $hidden = ['agiBehavior'];

    public function agiBehavior()
    {
        return $this->belongsTo(AgiBehavior::class, 'agi_behavior_id');
    }
    
    public function getAgiBehaviourAttribute()
    {
        return $this->agiBehavior;
    }

    // Define relationships with other tables (if any)
    
    // Define any additional model methods or attributes as needed
}
