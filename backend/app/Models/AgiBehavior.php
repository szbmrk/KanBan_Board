<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgiBehavior extends Model
{
    use HasFactory;

    protected $primaryKey = 'agi_behavior_id'; // Define the primary key field name

    protected $fillable = [
        'act_as_a',
    ];

    // Define any additional model methods or attributes as needed
}
