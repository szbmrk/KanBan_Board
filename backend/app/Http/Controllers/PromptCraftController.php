<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\AgiBehavior;
use Illuminate\Http\Request;
use App\Models\CraftedPrompt;
use App\Http\Controllers\AGIController;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\ChatGPTController;
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
            'crafted_prompt_title' => 'required|string',
            'crafted_prompt_text' => 'required|string',
            'craft_with' => 'required|in:CHATGPT,LLAMA,BARD', 
            'action' => 'required|in:GENERATETASK,GENERATESUBTASK,GENERATEATTACHMENTLINK', 
            ]);
        }
        catch (ValidationException) 
        {
            return response()->json(['error' => 'Invalid craft with or action value'], 400);
        }

        $craftedPrompt = new CraftedPrompt();
        $craftedPrompt->agi_behavior_id = PromptCraftController::CheckAndGenerateAlreadyExistingBehavior($request,
                                                                            $request->input('agi_behavior'),
                                                                            $boardId);

        $craftedPrompt->crafted_prompt_title = $request->input('crafted_prompt_title');
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

        if($prompt->board_id != $boardId) 
        {
            return response()->json(['error' => 'Prompt not found on this board.'], 404);
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
        
        $prompt->agi_behavior_id = PromptCraftController::CheckAndGenerateAlreadyExistingBehavior($request,
                                                                            $request->input('agi_behavior'),
                                                                            $boardId);
        
        
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

   
    public function usePrompts(Request $request, $boardId, $craftedPromptId)
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

        $craftedPrompt = CraftedPrompt::where('crafted_prompt_id', $craftedPromptId)->get()->first();

        if($craftedPrompt->crafted_prompt_id != $boardId) 
        {
            return response()->json(['error' => 'Prompt not found on this board.'], 404);
        }
        
/*         if ($craftedPrompts->isEmpty()) {
            return response()->json(['error' => 'No crafted prompts found for this board.'], 404);
        } */

        $request->headers->set('ChosenAI', $craftedPrompt->craft_with);
        $request->headers->set('TaskPrompt', $craftedPrompt->crafted_prompt_text);
        $request->headers->set('TaskCounter', "2");
        //$request->headers->set('PrecraftedPrompt', $craftedPrompt->crafted_prompt_text);

        switch ($craftedPrompt->action) {
            case "GENERATESUBTASK":
                $response = AGIController::GenerateSubtask($request);
                break;
            case "GENERATEATTACHMENTLINK":
                $response = AGIController::GenerateAttachmentLink($request);
                break;
            default:
                $response = AGIController::GenerateTask($request);
                break;
        }

        return $response;
    }


    public static function CheckAndGenerateAlreadyExistingBehavior($request, $agiBehavior, $boardId) 
    {
        if($agiBehavior != null)
        {
            $agiBehaviors = AgiBehavior::where('act_as_a', $request->input('agi_behavior'))->get();
            $exists = false;
        
            foreach($agiBehaviors as $behavior) 
            {
                if($behavior->board_id == $boardId) 
                {
                    $agi_behavior_id = $behavior->agi_behavior_id;
                    $exists = true;
                    break;
                }
            }
    
            if(!$exists) 
            {
                $agiBehavior = new AgiBehavior();
                $agiBehavior->act_as_a = $request->input('agi_behavior');
                $agiBehavior->board_id = $boardId;
                $agiBehavior->save();
                $agi_behavior_id = $agiBehavior->agi_behavior_id;
            }
        
        }  
        else 
        {
            $agi_behavior_id = null;
        }

        return $agi_behavior_id;

    }
}

