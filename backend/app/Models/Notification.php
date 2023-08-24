<?php

namespace App\Models;

use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Model;
use App\Traits\AdjustTimestampsForHungaryTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Notification extends Model
{
    use HasFactory;
    use AdjustTimestampsForHungaryTrait;

    protected $primaryKey = 'notification_id';
    protected $table = 'notifications';

    protected $fillable = ['user_id','type', 'content', 'is_read'];
   
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    
}
