<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\AdjustTimestampsForHungaryTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class UserAgiUsage extends Model
{
    use HasFactory;
    use AdjustTimestampsForHungaryTrait;


    protected $table = 'user_agi_usage';
    protected $primaryKey = 'user_agi_usage_id';

    protected $fillable = [
        'user_id',
        'counter',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function incrementCounter()
    {
        $this->counter++;
        $this->save();
    }

    public function canUse()
    {
        return $this->counter <= 20;
    }
}
