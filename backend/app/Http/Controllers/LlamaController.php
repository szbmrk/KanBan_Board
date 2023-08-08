<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\JsonResponse;

class LlamaController extends Controller
{
    public function generateSubtasks(Request $request): JsonResponse
    {
        $task = $request->input('title');

        $prompt = "As an AI assistant, generate short and understandable subtasks for the task: '{$task}'";

        $pythonScriptPath = env('LLAMA_PYTHON_SCRIPT_PATH');
        $apiToken = env('REPLICATE_API_TOKEN');
        $command = "set REPLICATE_API_TOKEN={$apiToken} && python {$pythonScriptPath} \"{$prompt}\"";
        try {
            $subtaskOutput = shell_exec("{$command} 2>&1");
        
            $subtaskCleaned = str_replace(["\n", "\r"], "", $subtaskOutput);
        
            // Felosztás a számokkal kezdődő részekre
            $subtaskFields = preg_split('/[0-9]+\.\s/', $subtaskCleaned, -1, PREG_SPLIT_NO_EMPTY);
        
            $formattedSubtasks = [];
            $isFirstTask = true;
        
            foreach ($subtaskFields as $subtaskField) {
                // Első mondat kiemelése, amely a subtask címét tartalmazza
                $firstSentence = strtok($subtaskField, '.');
        
                if ($isFirstTask) {
                    $isFirstTask = false;
                    continue;
                }
        
                $formattedSubtasks[] = [
                    'title' => trim($firstSentence),
                    'description' => trim(substr($subtaskField, strlen($firstSentence))),
                    'due_date' => date('Y-m-d', strtotime('+1 week')), // Éppeni dátum + 1 hét
                ];
            }
        
            return response()->json(['tasks' => $formattedSubtasks]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
