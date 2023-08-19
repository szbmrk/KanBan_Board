<?php

namespace App\Http\Controllers;

use App\Models\Attachment;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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

        $attachment->delete();

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

        return response()->json(['message' => 'Attachments created successfully']);
    }

}
