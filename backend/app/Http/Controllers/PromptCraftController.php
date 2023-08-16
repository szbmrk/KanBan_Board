<?php

namespace App\Http\Controllers;

use App\Models\CraftedPrompt;
use Illuminate\Http\Request;

class PromptCraftController extends Controller
{
    public function GetPrompts()
    {
        $craftedPrompts = CraftedPrompt::with('board', 'creator')->get();
        return response()->json(['craftedPrompts' => $craftedPrompts], 200);
    }
}
