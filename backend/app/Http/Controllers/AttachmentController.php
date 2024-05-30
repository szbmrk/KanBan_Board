<?php

namespace App\Http\Controllers;

use App\Models\Attachment;
use App\Models\Task;
use App\Models\UserTask;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

class AttachmentController extends Controller
{
    public function index(Request $request, $task_id)
    {
        $user = auth()->user();
        $task = Task::find($task_id);

        if (!$task) {
            return response()->json(['error' => 'Task not found'], 404);
        }

        $board = $task->column->board;

        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of this board'], 403);
        }

        $attachments = Attachment::where('task_id', $task_id)->get();

        if ($attachments->isEmpty()) {
            return response()->json(['message' => 'No attachments found for this task'], 200);
        }

        return response()->json(['attachments' => $attachments]);
    }

    public function store(Request $request, $task_id)
    {
        $user = auth()->user();
        $task = Task::find($task_id);

        if (!$task) {
            return response()->json(['error' => 'Task not found'], 404);
        }

        $board = $task->column->board;

        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of this board'], 403);
        }

        $request->validate([
            'link' => 'required|string',
        ]);

        $attachment = new Attachment([
            'task_id' => $task_id,
            'link' => $request->input('link'),
            'description' => $request->input('description'),
        ]);

        $attachment->save();

        $data = [
            'task' => $task,
            'attachment' => $attachment
        ];
        broadcast(new BoardChange($board->board_id, "CREATED_ATTACHMENT", $data));

        $user_ids = UserTask::where('task_id', $task_id)->pluck('user_id')->toArray();

        foreach ($user_ids as $user_id) {
            broadcast(new AssignedTaskChange($user_id, "CREATED_ATTACHMENT", $data));
        }

        return response()->json(['message' => 'Attachment created successfully', 'attachment' => $attachment]);
    }

    public function update(Request $request, $attachment_id)
    {
        $user = auth()->user();
        $attachment = Attachment::find($attachment_id);

        if (!$attachment) {
            return response()->json(['error' => 'Attachment not found'], 404);
        }

        $task = $attachment->task;
        $board = $task->column->board;

        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of this board'], 403);
        }

        $request->validate([
            'link' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);
        
        $attachment->update([
            'link' => $request->input('link'),
            'description' => $request->input('description'),
        ]);

        return response()->json(['message' => 'Attachment updated successfully', 'attachment' => $attachment]);
    }

    public function destroy($attachment_id)
    {
        $user = Auth::user();
        $attachment = Attachment::find($attachment_id);

        if (!$attachment) {
            return response()->json(['error' => 'Attachment not found'], 404);
        }

        $task = $attachment->task;
        $board = $task->column->board;

        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of this board'], 403);
        }

        $user_ids = UserTask::where('task_id', $task->task_id)->pluck('user_id')->toArray();

        $attachment->delete();

        $data = [
            'task' => $task,
            'attachment' => $attachment
        ];
        broadcast(new BoardChange($board->board_id, "DELETED_ATTACHMENT", $data));

        foreach ($user_ids as $user_id) {
            broadcast(new AssignedTaskChange($user_id, "DELETED_ATTACHMENT", $data));
        }

        return response()->json(['message' => 'Attachment deleted successfully']);
    }

    public function storeMultiple(Request $request, $task_id)
    {
        $user = auth()->user();
        
        $task = Task::find($task_id);

        if (!$task) {
            return response()->json(['error' => 'Task not found'], 404);
        }

        $board = $task->column->board;

        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of this board'], 403);
        }

        $request->validate([
            'attachments.*.link' => 'required|string',
        ]);

        $attachmentsData = $request->json('attachments');

        if (!is_array($attachmentsData)) {
            return response()->json(['error' => 'Attachments data is missing or not in the expected format'], 400);
        }

        $attachments = [];

        foreach ($attachmentsData as $attachmentData) {
         $attachment = new Attachment([
                'task_id' => $task_id,
                'link' => $attachmentData['link'],
                'description' => $attachmentData['description'] ?? null,
            ]);

            $attachment->save();
            $attachments[] = $attachment;
        }

        $data = [
            'task' => $task,
            'attachments' => $attachments
        ];
        broadcast(new BoardChange($board->board_id, "CREATED_MULTIPLE_ATTACHMENT", $data));

        $user_ids = UserTask::where('task_id', $task_id)->pluck('user_id')->toArray();

        foreach ($user_ids as $user_id) {
            broadcast(new AssignedTaskChange($user_id, "CREATED_MULTIPLE_ATTACHMENT", $data));
        }

        return response()->json(['message' => 'Attachments created successfully']);
    }

}
