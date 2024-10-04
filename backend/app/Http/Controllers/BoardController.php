<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Board;
use Illuminate\Validation\Rule;
use App\Helpers\LogRequest;

class BoardController extends Controller
{
    public function show($board_id)
    {
        $user = auth()->user();

        $board = Board::with([
            'columns.tasks.tags' => function ($query) {
                // Add an orderBy clause to sort tags by tag_id
                $query->orderBy('tag_id');
            },
            'columns.tasks.subtasks',
            'columns.tasks.comments',
            'columns.tasks.priority',
            'columns.tasks.attachments',
            'columns.tasks.members',
        ])->find($board_id);

        if (!$board) {
            LogRequest::instance()->logAction('BOARD NOT FOUND', $user->user_id, "Board not found. -> board_id: $board_id", null, null, null);
            return response()->json(['error' => 'Board not found'], 404);
        }

        if ($user->hasPermission('system_admin')) {
            return response()->json(['board' => $board]);
        }

        if (!$user->isMemberOfBoard($board_id)) {
            LogRequest::instance()->logAction('NO PERMISSION', $user->user_id, "User does not have permission. -> Get Board", null, null, null);
            return response()->json(['error' => 'You are not a member of this board'], 403);
        } else {
            return response()->json(['board' => $board]);
        }

    }
}