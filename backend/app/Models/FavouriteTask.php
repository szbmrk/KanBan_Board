<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FavouriteTask extends Model
{
    use HasFactory;

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
