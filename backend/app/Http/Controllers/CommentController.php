<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Task;
use App\Models\UserTask;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;
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

class CommentController extends Controller
{
    public function index($task_id)
    {
        $user = Auth::user();
        $task = Task::find($task_id);

        if (!$task) {
            return response()->json(['error' => 'Task not found'], 404);
        }

        $board = $task->column->board;

        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of this board'], 403);
        }

        $comments = Comment::where('task_id', $task_id)->get();

        return response()->json(['comments' => $comments]);
    }

    public function commentStore(Request $request, $task_id)
    {
        $user = Auth::user();
        $task = Task::find($task_id);

        if (!$task) {
            return response()->json(['error' => 'Task not found'], 404);
        }

        $board = $task->column->board;

        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of this board'], 403);
        }

        $request->validate([
            'text' => 'required|string',
        ]);

        $comment = new Comment([
            'task_id' => $task_id,
            'user_id' => $user->user_id,
            'text' => $request->input('text'),
        ]);

        $comment->save();
        $commentWithUser = Comment::with('user')->find($comment->comment_id);

        $data = [
            'task' => $task,
            'comment' => $commentWithUser
        ];
        broadcast(new BoardChange($board->board_id, "CREATED_COMMENT", $data));

        $user_ids = UserTask::where('task_id', $task_id)->pluck('user_id')->toArray();

        foreach ($user_ids as $user_id) {
            broadcast(new AssignedTaskChange($user_id, "CREATED_COMMENT", $data));
        }

        return response()->json(['message' => 'Comment created successfully', 'comment' => $commentWithUser]);
    }

    public function commentDelete($comment_id)
    {
        $user = Auth::user();
        $comment = Comment::find($comment_id);

        if (!$comment) {
            return response()->json(['error' => 'Comment not found'], 404);
        }

        $task = $comment->task;
        $board = $task->column->board;

        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of this board'], 403);
        }

        // Ellenőrizd, hogy a felhasználó tényleg törölheti-e a kommentet
        if ($comment->user_id !== $user->user_id) {
            return response()->json(['error' => 'You are not authorized to delete this comment'], 403);
        }

        $commentWithUser = Comment::with('user')->find($comment->comment_id);
        $comment->delete();

        $data = [
            'task' => $task,
            'comment' => $commentWithUser
        ];
        broadcast(new BoardChange($board->board_id, "DELETED_COMMENT", $data));

        $user_ids = UserTask::where('task_id', $task->task_id)->pluck('user_id')->toArray();

        foreach ($user_ids as $user_id) {
            broadcast(new AssignedTaskChange($user_id, "DELETED_COMMENT", $data));
        }

        return response()->json(['message' => 'Comment deleted successfully']);
    }
}