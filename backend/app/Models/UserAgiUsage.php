<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\AdjustTimestampsForHungaryTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class UserAgiUsage extends Model
{
    use HasFactory;
    use AdjustTimestampsForHungaryTrait;

    protected $table = 'user_agi_usage';
    protected $primaryKey = 'user_id';
    public $incrementing = false;

    protected $fillable = [
        'counter',
        'counter_reset_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function incrementCounter()
    {
        $this->counter++;

        if ($this->counter >= 20) {
            $this->counter_reset_at = Carbon::now();
        }

        $this->save();
    }

    public function canUse()
    {
        if ($this->counter <= 20) {
            return true;
        }

        if ($this->counter_reset_at && Carbon::parse($this->counter_reset_at)->addHours(24)->isPast()) {
            $this->counter = 0;
            $this->counter_reset_at = null;
            $this->save();

            return true;
        }

        return false;
    }
}
