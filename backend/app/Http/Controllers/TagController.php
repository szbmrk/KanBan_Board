<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tag;
use App\Models\Board;
use App\Models\UserTask;
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

class TagController extends Controller
{
    public function index($boardId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized.'], 404);
        }

        $board = Board::where('board_id', $boardId)->first();

        if (!$board) {
            return response()->json(['error' => 'Board not found.'], 404);
        }

        if ($user->hasPermission('system_admin')) {
            $tags = Tag::where('board_id', $boardId)->get();
            return response()->json(['tags' => $tags], 200);
        }

        if (!$board->team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $tags = Tag::where('board_id', $boardId)->get();


        return response()->json(['tags' => $tags], 200);
    }

    public function store(Request $request, $boardId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized.'], 404);
        }

        $board = Board::where('board_id', $boardId)
            ->whereHas('team.teamMembers', function ($query) use ($user) {
                $query->where('user_id', $user->user_id);
            })
            ->first();

        if (!$board) {
            return response()->json(['error' => 'Board not found.'], 404);
        }

        $team = $board->team;
        if (!$team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:35',
            'color' => 'required|string|max:7',
        ]);
        if ($board->tags()->where('name', $request->input('name'))->exists()) {
            return response()->json(['error' => 'A tag with the same name already exists for this board.'], 422);
        }

        if ($board->tags()->where('color', $request->input('color'))->exists()) {
            return response()->json(['error' => 'A tag with the same color already exists for this board.'], 422);
        }
        $tag = new Tag();
        $tag->name = $request->input('name');
        $tag->color = $request->input('color');
        $tag->board_id = $boardId;
        $tag->save();

        return response()->json(['message' => 'Tag created successfully.'], 201);
    }


    public function update(Request $request, $boardId, $tagId)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized.'], 404);
        }

        $board = Board::where('board_id', $boardId)->first();

        if (!$board) {
            return response()->json(['error' => 'Board not found.'], 404);
        }

        $team = $board->team;

        if (!$team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(['error' => 'You are not a member of the team.'], 404);
        }

        $tag = Tag::where('tag_id', $tagId)
            ->where('board_id', $boardId)
            ->first();

        if (!$tag) {
            return response()->json(['error' => 'Tag not found for the specified board.'], 404);
        }

        $team = $board->team;
        if (!$team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'required|string|max:7',
        ]);
        if ($board->tags()->where('name', $request->input('name'))->where('tag_id', '!=', $tagId)->exists()) {
            return response()->json(['error' => 'A tag with the same name already exists for this board.'], 422);
        }


        if ($board->tags()->where('color', $request->input('color'))->where('tag_id', '!=', $tagId)->exists()) {
            return response()->json(['error' => 'A tag with the same color already exists for this board.'], 422);
        }

        $tag->name = $request->input('name');
        $tag->color = $request->input('color');
        $tag->save();

        $data = [
            'tag' => $tag,
        ];
        broadcast(new BoardChange($boardId, "UPDATED_TAG", $data));

        $user_ids = UserTask::whereIn('task_id', function ($query) use ($tagId) {
            $query->select('task_id')
                ->from('task_tags')
                ->where('tag_id', $tagId);
        })->pluck('user_id')->toArray();

        foreach ($user_ids as $user_id) {
            broadcast(new AssignedTaskChange($user_id, "UPDATED_TAG", $data));
        }

        return response()->json(['message' => 'Tag updated successfully.'], 200);
    }


    public function destroy($boardId, $tagId)
    {

        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized.'], 404);
        }

        $board = Board::where('board_id', $boardId)->first();

        if (!$board) {
            return response()->json(['error' => 'Board not found.'], 404);
        }

        $team = $board->team;

        if (!$team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 404);
        }

        $tag = Tag::where('tag_id', $tagId)
            ->where('board_id', $boardId)
            ->first();

        if (!$tag) {
            return response()->json(['error' => 'Tag not found for the specified board.'], 404);
        }

        $user_ids = UserTask::whereIn('task_id', function ($query) use ($tagId) {
            $query->select('task_id')
                ->from('task_tags')
                ->where('tag_id', $tagId);
        })->pluck('user_id')->toArray();

        $tag->delete();

        $data = [
            'tag' => $tag,
        ];
        broadcast(new BoardChange($boardId, "DELETED_TAG", $data));

        foreach ($user_ids as $user_id) {
            broadcast(new AssignedTaskChange($user_id, "DELETED_TAG", $data));
        }

        return response()->json(['message' => 'Tag deleted successfully.'], 200);

    }


}