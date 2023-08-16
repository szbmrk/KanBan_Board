<?php

namespace App\Http\Controllers;

use App\Models\CraftedPrompt;
use Illuminate\Http\Request;
use App\Models\Board;
use Illuminate\Validation\ValidationException;

class PromptCraftController extends Controller
{
    public function getPrompts($boardId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized.'], 401);
        }

        $board = Board::where('board_id', $boardId)->first();

        if (!$board) {
            return response()->json(['error' => 'Board not found.'], 404);
        }

        if (!$board->team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $craftedPrompts = CraftedPrompt::where('board_id', $boardId)->get();
        
        if ($craftedPrompts->isEmpty()) {
            return response()->json(['error' => 'No crafted prompts found for this board.'], 404);
        }

        return response()->json($craftedPrompts, 200);
    }

    public function storePrompts(Request $request, $boardId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized.'], 401);
        }

        

        $board = Board::where('board_id', $boardId)->first();
        if (!$board) {
            return response()->json(['error' => 'Board not found.'], 404);
        }

        if (!$board->team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        try{ 
            $this->validate($request, [
            'craft_with' => 'required|in:CHATGPT,LLAMA,BARD', 
            'action' => 'required|in:GENERATETASK, GENERATESUBTASK, GENERATEATTACHMENTLINK', 
            ]);
        }
        catch (ValidationException) 
        {
            return response()->json(['error' => 'Invalid craft with or action value'], 400);
        }
        
        $craftedPrompt = new CraftedPrompt();
        $craftedPrompt->crafted_prompt_text = $request->input('crafted_prompt_text');
        $craftedPrompt->craft_with = $request->input('craft_with');
        $craftedPrompt->action = $request->input('action');
        $craftedPrompt->board_id = $boardId;
        $craftedPrompt->created_by = $user->user_id;
        $craftedPrompt->save();

        return response()->json(['message' => 'Crafted prompt created successfully.'], 201);
    }

}
