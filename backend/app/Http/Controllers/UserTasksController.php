<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserTask;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;
use App\Models\Board;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use App\Events\BoardChange;
use App\Events\AssignedTaskChange;
use Illuminate\Support\Facades\Event;

class UserTasksController extends Controller
{
    public function index($user_id)
    {
        $user = auth()->user();

        if ($user->user_id != $user_id) {
            return response()->json(['error' => 'You do not have permission to fetch this user\'s tasks'], 403);
        }

        $assignedTasks = Task::whereHas('members', function ($query) use ($user_id) {
            $query->where('user_id', $user_id);
        })->get();

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
        $task = Task::with('subtasks', 'tags', 'comments', 'priority', 'attachments', 'members')->find($task_id);

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

        $data = [
            'task' => $task,
            'member' => $member
        ];
        broadcast(new BoardChange($task->board_id, "CREATED_USER_TASK", $data));

        $data = [
            'task' => $task
        ];
        broadcast(new AssignedTaskChange($new_user_id, "ASSIGNED_TO_TASK", $data));

        NotificationController::createNotification(NotificationType::BOARD, "You are assigned to the following task: " . $task->title, $new_user_id);

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

        // Get the task
        $task = Task::find($task_id);

        // Check if the task exists
        if (!$task) {
            return response()->json(['error' => 'Task not found'], 404);
        }

        $member = User::where('user_id', $user_id)->first();

        $assignment->delete();

        $data = [
            'task' => $task,
            'member' => $member
        ];
        broadcast(new BoardChange($task->board_id, "DELETED_USER_TASK", $data));

        $data = [
            'task' => $task
        ];
        broadcast(new AssignedTaskChange($user_id, "UNASSIGNED_FROM_TASK", $data));

        NotificationController::createNotification(NotificationType::BOARD, "You are unassigned from the following task: " . $task->title, $user_id);

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

        if (!$user->isMemberOfBoard($board->board_id)) {
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