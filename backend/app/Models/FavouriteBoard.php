<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FavouriteBoard extends Model
{
    public $timestamps = false;

    protected $table = 'favourite_boards';
    protected $primaryKey = 'id';

    protected $fillable = [
        'board_id',
        'user_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function board()
    {
        return $this->belongsTo(Board::class, 'board_id');
    }
}
