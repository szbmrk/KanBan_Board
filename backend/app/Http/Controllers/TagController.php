<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tag;
use App\Models\Board;

class TagController extends Controller
{
    public function index($boardId)
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
            return response()->json(['error' => 'Board not found or you are not a member of the team.'], 404);
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
            return response()->json(['error' => 'Board not found or you are not a member of the team.'], 404);
        }

        $team = $board->team;
        if (!$team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
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

        $board = Board::where('board_id', $boardId)
                      ->whereHas('team.teamMembers', function ($query) use ($user) {
                          $query->where('user_id', $user->user_id);
                      })
                      ->first();

        if (!$board) {
            return response()->json(['error' => 'Board not found or you are not a member of the team.'], 404);
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
    
        // Check if a tag with the same color already exists for the board (excluding the current tag being updated)
        if ($board->tags()->where('color', $request->input('color'))->where('tag_id', '!=', $tagId)->exists()) {
            return response()->json(['error' => 'A tag with the same color already exists for this board.'], 422);
        }
        
        $tag->name = $request->input('name');
        $tag->color = $request->input('color');
        $tag->save();

        return response()->json(['message' => 'Tag updated successfully.'], 200);
    }


    public function destroy($boardId, $tagId) {

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
          return response()->json(['error' => 'Board not found or you are not a member of the team.'], 404);
        }
      
        $tag = Tag::where('tag_id', $tagId)
                    ->where('board_id', $boardId)
                    ->first();
      
        if (!$tag) {
          return response()->json(['error' => 'Tag not found for the specified board.'], 404); 
        }
      
        $team = $board->team;
        
      
        if (!$team->teamMembers()->where('user_id', $user->user_id)->exists()) {
          return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $tag->delete();
      
        return response()->json(['message' => 'Tag deleted successfully.'], 200);
      
      }
      
      
}