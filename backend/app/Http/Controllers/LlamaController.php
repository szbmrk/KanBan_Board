<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class LlamaController extends Controller
{
    public function generateSubtasks(Request $request)
    {
        $task = "Create a kanban board";
        $column = "To Do";

        $prompt = "Generate kanban tickets for {$task}. Write estimations to the tickets as well and add a tag to each ticket. The tickets should be in the column '{$column}'. Write a description to each of them as well";

        $pythonScriptPath = env('LLAMA_PYTHON_SCRIPT_PATH');
        $apiToken = env('REPLICATE_API_TOKEN');
        $command = "set REPLICATE_API_TOKEN={$apiToken} && python {$pythonScriptPath} \"{$prompt}\"";

        try {
            $subtask = shell_exec("{$command} 2>&1");

            return response()->json(['subtask' => $subtask]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()]);
        }
    }
}