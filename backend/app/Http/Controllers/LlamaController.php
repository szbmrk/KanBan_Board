<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class LlamaController extends Controller
{
    public function generateSubtasks(Request $request)
    {
        $task = $request->input('title');  // A taszk címét most a kérésből kapjuk meg

        $prompt = "As an AI assistant, generate short and understandable subtasks for the task: '{$task}'";

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