<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SummaryLog extends Model
{
    use HasFactory;

    protected $fillable = ['date', 'summary', 'logs', 'tasks_created_count', 'tasks_finished_count'];

    protected $casts = [
        'logs' => 'array',
    ];
}
