<?php

namespace App\Models;

use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Model;
use App\Traits\AdjustTimestampsForHungaryTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AgiBehavior extends Model
{
    use HasFactory;
    use AdjustTimestampsForHungaryTrait;

    protected $primaryKey = 'agi_behavior_id'; // Define the primary key field name

    protected $fillable = [
        'act_as_a',
    ];

    public function craftedPrompts()
    {
        return $this->hasMany(CraftedPrompt::class, 'agi_behavior_id');
    }

    // Define any additional model methods or attributes as needed
}
