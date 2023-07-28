<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    use HasFactory;

    protected $primaryKey = 'team_id';

    protected $fillable = [
        'name',
        'parent_team_id',
        'created_by',
    ];

    public function boards()
    {
        return $this->hasMany(Board::class, 'team_id', 'team_id');
    }
}
