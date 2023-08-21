<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\AgiBehavior;
use Illuminate\Http\Request;
use App\Models\CraftedPrompt;

class AgiBehaviorController extends Controller
{
    public function GetBehaviors($boardId)
    {
        // Get all crafted prompts for this board
        $craftedPrompts = CraftedPrompt::where('board_id', $boardId)->get();
    
        // Initialize an empty array to store the agiBehaviors
        $agiBehaviors = array();
    
        foreach ($craftedPrompts as $craftedPrompt) {
            $agiBehavior = AgiBehavior::find($craftedPrompt->agi_behavior_id);
    
            if ($agiBehavior != null) {
                // Append each agiBehavior as an object with the "act_as_a" key
                $agiBehaviors[] = ['act_as_a' => $agiBehavior->act_as_a];
            }
        }
    
        return response()->json(['agiBehaviors' => $agiBehaviors], 200);
    }
}
