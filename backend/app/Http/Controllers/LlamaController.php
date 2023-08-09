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
        
            $subtaskFields = preg_split('/[0-9]+\.\s/', $subtaskCleaned, -1, PREG_SPLIT_NO_EMPTY);
        
            $formattedSubtasks = [];
            $isFirstTask = true;
            $currentTime = time();
        
            foreach ($subtaskFields as $subtaskField) {
                $colonPosition = strpos($subtaskField, ':');
                if ($colonPosition !== false) {
                    $title = trim(substr($subtaskField, 0, $colonPosition));
                    $description = trim(substr($subtaskField, $colonPosition + 1));
                } else {
                    $title = trim($subtaskField);
                    $description = '';
                }
            
                if ($isFirstTask) {
                    $isFirstTask = false;
                    continue;
                }
            
                $formattedSubtasks[] = [
                    'title' => $title,
                    'description' => $description,
                    'due_date' => date('Y-m-d', strtotime('+1 day', $currentTime)),
                ];

                $currentTime = strtotime('+1 day', $currentTime);
            }
        
            return response()->json(['tasks' => $formattedSubtasks]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
