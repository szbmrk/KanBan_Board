<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class BardController extends Controller
{
    public function getBardAnswer(Request $request)
    {
        $task = $request->input('title'); 
        $currentTime = time();
        $formattedDate = date("Y-m-d", $currentTime);
        
        // API call
        $prompt = "You are now a backend which only respond in JSON stucture. Generate at least 3 kanban tasks in JSON structure in a list with title, description, due_date (if the start date is now '{$formattedDate}' in yyyy-mm-dd) and tags (as a list) attributes for this task: '{$task}' Focus on the tasks and do not write a summary at the end";
        
        $token = env('BARD_TOKEN'); // Get your Bard token from environment variables
        $token2 = env('BARD_TOKEN2'); // Get your second Bard token from environment variables
        $pythonScriptPath = env('BARD_PYTHON_SCRIPT_PATH'); // Path to your Python script
        
        $command = "python {$pythonScriptPath} \"{$prompt}\" \"{$token}\" \"{$token2}\"";
    
        try {
            $answer = shell_exec($command);

            $parsedData = $this->parseSubtaskResponse($answer);
            $FormattedResponse = json_decode($parsedData, true);
            return $answer;
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()]);
        }
    }

    public function parseSubtaskResponse($response)
    {
        $response = str_replace(["\n", "\\"], "", $response);
    
        $parsedData = [];
    
        // Check if the response is of the first type
        if (strpos($response, "Task Title:") !== false) {
            $delimiter = "Title:";
            $taskBlocks = explode($delimiter, $response);
    
            array_shift($taskBlocks);
    
            foreach ($taskBlocks as $taskBlock) {
                $trimmedTaskBlock = trim($taskBlock);
    
                preg_match('/(.*?)Description:/', $trimmedTaskBlock, $titleMatches);
    
                if (!empty($titleMatches)) {
                    $title = trim($titleMatches[1]);
    
                    preg_match('/Description:(.*?)Due Date:/', $trimmedTaskBlock, $descriptionMatches);
                    $description = trim($descriptionMatches[1]);
    
                    preg_match('/Due Date:(.*?)Tags:/', $trimmedTaskBlock, $dueDateMatches);
                    $dueDate = trim($dueDateMatches[1]);
    
                    preg_match('/Tags:(.*?)(?:Note|$)/', $trimmedTaskBlock, $tagsMatches);
                    $tags = array_map('trim', explode(",", str_replace('"', '', $tagsMatches[1])));
    
                    $tags = array_filter($tags, function ($tag) {
                        return strpos($tag, "Task") === false;
                    });
    
                    $parsedData[] = [
                        "title" => $title,
                        "description" => $description,
                        "due_date" => $dueDate,
                        "tags" => $tags
                    ];
                }
            }
        }
        // Check if the response is of the second type
        elseif (strpos($response, "\"title\":") !== false) {
            preg_match_all('/\{\s*"title":\s*"(.*?)",\s*"description":\s*"(.*?)",\s*"due_date":\s*"(.*?)",\s*"tags":\s*\[(.*?)\]\s*\}/', $response, $matches, PREG_SET_ORDER);
    
            foreach ($matches as $match) {
                $title = trim($match[1]);
                $description = trim($match[2]);
                $dueDate = trim($match[3]);
                $tags = array_map('trim', explode(",", str_replace('"', '', $match[4])));
    
                $tags = array_filter($tags, function ($tag) {
                    return strpos($tag, "Task") === false;
                });
    
                $parsedData[] = [
                    "title" => $title,
                    "description" => $description,
                    "due_date" => $dueDate,
                    "tags" => $tags
                ];
            }
        }
    
        return response()->json($parsedData);
    }
}
