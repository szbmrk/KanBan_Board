<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserTask;
use App\Models\Task;
use App\Models\Team;

class UserTasksController extends Controller
{
    public function index($user_id)
    {
        $user = auth()->user();

        if ($user->user_id != $user_id) {
            return response()->json(['error' => 'You do not have permission to fetch this user\'s tasks'], 403);
        }

        $assignedTasks = UserTask::with(['task.priority', 'task.tags', 'task.comments.user', 'task.attachments'])
        ->where('user_id', $user_id)
        ->get();

        return response()->json(['assigned_tasks' => $assignedTasks]);
    }
}