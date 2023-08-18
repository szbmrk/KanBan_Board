<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserTask;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;
use App\Models\Board;

class UserTasksController extends Controller
{
    public function index($user_id)
    {
        $user = auth()->user();

        if ($user->user_id != $user_id) {
            return response()->json(['error' => 'You do not have permission to fetch this user\'s tasks'], 403);
        }

        $assignedTasks = UserTask::with(['task.priority', 'task.tags', 'task.comments.user', 'task.attachments', 'task.subtasks'])
            ->where('user_id', $user_id)
            ->get();

        return response()->json(['assigned_tasks' => $assignedTasks]);
    }

    public function store(Request $request, $task_id)
    {
        $user = auth()->user();

        // Null validation for the user
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Get the task
        $task = Task::find($task_id);

        // Check if the task exists
        if (!$task) {
            return response()->json(['error' => 'Task not found'], 404);
        }

        $request->validate([
            'user_id' => 'required|integer',
        ]);

        $new_user_id = $request->input('user_id');
        // Create the assignment
        UserTask::create([
            'user_id' => $new_user_id,
            'task_id' => $task_id,
        ]);

        $member = User::where('user_id', $new_user_id)->first();

        return response()->json(['message' => 'Task assigned successfully', 'member' => $member]);
    }
    public function destroy($task_id, $user_id)
    {
        $user = auth()->user();

        $assignment = UserTask::where('user_id', $user_id)
            ->where('task_id', $task_id);

        if (!$assignment) {
            return response()->json(['error' => 'Task assignment not found'], 404);
        }

        $assignment->delete();

        return response()->json(['message' => 'Task unassigned successfully']);
    }

    public function getNotAssigned($board_id, $task_id)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized.'], 404);
        }

        $board = Board::where('board_id', $board_id)->first();

        if (!$board) {
            return response()->json(['error' => 'Board not found.'], 404);
        }

        if (!$board->team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $task = Task::where('task_id', $task_id)->first();

        if (!$task) {
            return response()->json(['error' => 'Task not found.'], 404);
        }

        $assignedUsers = $task->members->pluck('user_id');

        $notAssignedUsers = $board->team->teamMembers->whereNotIn('user_id', $assignedUsers)->values()->pluck('user_id');
        $notAssignedUsers = User::whereIn('user_id', $notAssignedUsers)->get();

        return response()->json(['users' => $notAssignedUsers]);
    }
}