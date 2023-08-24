<?php

namespace App\Models;

use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Model;
use App\Traits\AdjustTimestampsForHungaryTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FavouriteTask extends Model
{
    use HasFactory;
    use AdjustTimestampsForHungaryTrait;

    protected $primaryKey = 'favourite_id';

    public function user()
    {
      return $this->belongsTo(User::class); 
    }
  
    public function task() 
    {
      return $this->belongsTo(Task::class);
    }
}
