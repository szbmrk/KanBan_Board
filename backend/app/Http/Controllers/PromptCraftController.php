<?php

namespace App\Http\Controllers;

use App\Models\CraftedPrompt;
use Illuminate\Http\Request;
use App\Models\Board;
use Illuminate\Support\Facades\Validator;
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
            'crafted_prompt_text' => 'required|string',
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

    public function updatePrompts(Request $request, $boardId, $promptId)
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

        $validator = Validator::make($request->all(), [
            'crafted_prompt_text' => 'string',
            'craft_with' => 'in:CHATGPT,LLAMA,BARD',
            'action' => 'in:GENERATETASK,GENERATESUBTASK,GENERATEATTACHMENTLINK',
        ]);

        if ($validator->fails()) {
            $errorMessages = [];
            
            if ($validator->errors()->hasAny(['crafted_prompt_text', 'craft_with', 'action'])) {
            
                
                if ($validator->errors()->has('crafted_prompt_text')) {
                    $errorMessages[] = $validator->errors()->first('crafted_prompt_text');
                }
                
                if ($validator->errors()->has('craft_with')) {
                    $errorMessages[] = $validator->errors()->first('craft_with');
                }
                
                if ($validator->errors()->has('action')) {
                    $errorMessages[] = $validator->errors()->first('action');
                }
            }
            
            return response()->json(['error' => implode(', ', $errorMessages)], 422);
        }

        $prompt = CraftedPrompt::find($promptId);

        if (!$prompt) {
            return response()->json(['error' => 'Prompt not found.'], 404);
        }

        if ($request->has('crafted_prompt_text')) {
            $prompt->crafted_prompt_text = $request->input('crafted_prompt_text');
        }

        if ($request->has('craft_with')) {
            $prompt->craft_with = $request->input('craft_with');
        }

        if ($request->has('action')) {
            $prompt->action = $request->input('action');
        }

        $prompt->save();

        return response()->json(['message' => 'Prompt updated successfully.'], 200);
    }

    public function destroyPrompts($boardId, $promptId)
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

        $prompt = CraftedPrompt::find($promptId);

        if (!$prompt) {
            return response()->json(['error' => 'Prompt not found.'], 404);
        }

        $prompt->delete();

        return response()->json(['message' => 'Prompt deleted successfully.'], 200);
    }

}

