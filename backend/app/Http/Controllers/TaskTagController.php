<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TaskTag;

class TaskTagController extends Controller
{
    public function index($task_id)
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        $tags = TaskTag::where('task_id', $task_id)->get();

        return response()->json($tags);
    }
}
