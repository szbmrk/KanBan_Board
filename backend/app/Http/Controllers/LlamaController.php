<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class LlamaController extends Controller
{
    public function generateSubtasks(Request $request)
    {
        $task = $request->input('title'); 
        $currentTime = time();
        $formattedDate = date("Y-m-d", $currentTime);
        
        // API call
        $prompt = "As an AI assistant, generate atleast 3 short and understandable subtasks for the task: '{$task}' Please always divide your answer into for example like this: Title: {content1} Description: {content1} Due Date: {content1} Tags: {#tag-1, #tag-2}  and assign a due date relative to the current date: '{$formattedDate}' in this format: YYYY-MM-DD and assign tags, Please include at least one value for each field mainly for tags. Focus on the tasks and do not write a summary at the end ";
        
        $pythonScriptPath = env('LLAMA_PYTHON_SCRIPT_PATH');
        $apiToken = env('REPLICATE_API_TOKEN');
        $command = "set REPLICATE_API_TOKEN={$apiToken} && python {$pythonScriptPath} \"{$prompt}\"";
        
        try {
            $subtaskResponse = shell_exec("{$command} 2>&1");
            
            // Process API response
            $subtaskResponse = str_replace("\n", '', $subtaskResponse);
            $subtasksArray = explode('Title:', $subtaskResponse);
            unset($subtasksArray[0]);
            
            $subtasks = [];
            
            foreach ($subtasksArray as $subtask) {
                $subtask = trim($subtask);
        
                list($title, $descriptionAndRest) = explode('Description:', $subtask, 2);
                $title = trim($title);
        
                list($description, $dueDateAndRest) = explode('Due Date:', $descriptionAndRest, 2);
                $description = trim($description);
        
                if (strpos($dueDateAndRest, 'Tags:') !== false) {
                    list($dueDate, $tagsAndRest) = explode('Tags:', $dueDateAndRest, 2);
                    $dueDate = trim($dueDate);
                    $tags = explode(',', $tagsAndRest);
                    $tags = array_map('trim', $tags);
                } else {
                    $dueDate = trim($dueDateAndRest);
                    $tags = [];
                }
        
                $subtasks[] = [
                    'title' => $title,
                    'description' => $description,
                    'due_date' => $dueDate,
                    'tags' => $tags,
                ];
            }
        
            $jsonSubtaskResponse = json_encode(['tasks' => $subtasks], JSON_PRETTY_PRINT);
        
            echo $jsonSubtaskResponse;
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()]);
        }
    }

    public function testSubtaskParsing()
    {

        $currentTime = time();
        $formattedDate = date("Y-m-d", $currentTime);

        $response = "..";

        $response = str_replace("\n", '', $response);
        
        $tasksArray = explode('Title:', $response);
        
        unset($tasksArray[0]);
        
        $tasks = [];

        foreach ($tasksArray as $task) {
            $task = trim($task);

            list($title, $descriptionAndRest) = explode('Description:', $task, 2);
            $title = trim($title);

            list($description, $dueDateAndRest) = explode('Due Date:', $descriptionAndRest, 2);
            $description = trim($description);

            if (strpos($dueDateAndRest, 'Tags:') !== false) {
                list($dueDate, $tagsAndRest) = explode('Tags:', $dueDateAndRest, 2);
                $dueDate = trim($dueDate);
                $tags = explode(',', $tagsAndRest);
                $tags = array_map('trim', $tags);
            } else {
                $dueDate = trim($dueDateAndRest);
                $tags = [];
            }

            $tasks[] = [
                'title' => $title,
                'description' => $description,
                'due_date' => $dueDate,
                'tags' => $tags,
            ];
        }

        $jsonResponse = json_encode(['tasks' => $tasks], JSON_PRETTY_PRINT);

        echo $jsonResponse;
    }

}