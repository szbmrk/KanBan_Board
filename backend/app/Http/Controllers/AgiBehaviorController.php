<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\AgiBehavior;
use Illuminate\Http\Request;
use App\Models\CraftedPrompt;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;



class AgiBehaviorController extends Controller
{
    public function GetBehaviors($boardId)
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

        // Get all crafted prompts for this board
        $craftedPrompts = CraftedPrompt::where('board_id', $boardId)->get();
    
        // Initialize an empty array to store the agiBehaviors
        $agiBehaviors = array();
    
        foreach ($craftedPrompts as $craftedPrompt) {
            $agiBehavior = AgiBehavior::find($craftedPrompt->agi_behavior_id);
    
            if ($agiBehavior != null) {
                // Append each agiBehavior as an object with the "act_as_a" key
                $agiBehaviors[] = $agiBehavior;
            }
        }
    
        return response()->json(['agiBehaviors' => $agiBehaviors], 200);
    }

    public function StoreBehavior(Request $request, $boardId)
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
            'agi_behavior' => 'string'
        ]);

        if ($validator->fails()) {
            $errorMessages = [];
            
            if ($validator->errors()->hasAny(['agi_behavior'])) {
                $errorMessages[] = $validator->errors()->first('agi_behavior');    
            }
            
            return response()->json(['error' => implode(', ', $errorMessages)], 422);
        }
        
        

        //find agi behaviorid by the act_as_a value
        $agiBehaviors = AgiBehavior::where('act_as_a', $request->input('agi_behavior'))->get();

        foreach ($agiBehaviors as $agiBehavior) {
            if($agiBehavior->board_id == $boardId) {
                return response()->json(['error' => 'Behavior already exists on this board!'], 422);
            }
        }           
        
        
        $agiBehavior = new AgiBehavior();
        $agiBehavior->act_as_a = $request->input('agi_behavior');
        $agiBehavior->board_id = $boardId;
        $agiBehavior->save();
        
        return response()->json(['message' => 'Behavior Stored successfully.'], 200);
    }
}
