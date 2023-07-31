<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Board extends Model
{
    use HasFactory;

    protected $primaryKey = 'board_id';

    protected $fillable = [
        'name',
        'team_id',
    ];

    // Relationship with the Column model
    public function columns()
    {
        return $this->hasMany(Column::class, 'board_id', 'board_id');
    }
}
