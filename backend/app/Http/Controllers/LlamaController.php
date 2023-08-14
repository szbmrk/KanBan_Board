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
        $prompt = "You are now a backend which only respond in JSON stucture. Generate at least 3 kanban tasks in JSON structure in a list with title, description, due_date (if the start date is now '{$formattedDate}' in yyyy-mm-dd) and tags (as a list) attributes for this task: '{$task}' Focus on the tasks and do not write a summary at the end";
        
        $pythonScriptPath = env('LLAMA_PYTHON_SCRIPT_PATH');
        $apiToken = env('REPLICATE_API_TOKEN');
        $command = "set REPLICATE_API_TOKEN={$apiToken} && python {$pythonScriptPath} \"{$prompt}\"";
        
        try {
            $subtaskResponse = shell_exec("{$command} 2>&1");
    
            // Call the parseSubtaskResponse function
            $parsedData = $this->parseSubtaskResponse($subtaskResponse);
    
            // Return both parsed data and raw response for debugging
            return response()->json([
                "parsed_data" => $parsedData,
                "raw_response" => $subtaskResponse
            ]);
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
    
    public function testSubtaskParsing()
    {
        $response = "\n Sure\n!\n Here\n are\n three\n Kan\nban\n tasks\n in\n JSON\n structure\n based\n on\n the\n task\n \"\nCreate\n drag\n and\n drop\n function\n on\n backend\n\":\n\n\n\n\n[\n\n\n\n {\n\n\n  \n \"\ntitle\n\":\n \"\nDrag\n and\n Drop\n Function\n Im\nplementation\n\",\n\n\n  \n \"\ndescription\n\":\n \"\nIm\nplement\n a\n drag\n and\n drop\n functionality\n on\n the\n backend\n to\n allow\n users\n to\n easily\n upload\n files\n and\n move\n them\n between\n lists\n.\",\n\n\n  \n \"\ndue\n_\ndate\n\":\n \"\n2\n0\n2\n3\n-\n0\n8\n-\n1\n1\n\",\n\n\n  \n \"\ntags\n\":\n [\"\nbackend\n development\n\",\n \"\ndrag\n and\n drop\n functionality\n\",\n \"\nfile\n upload\n\"]\n\n\n\n },\n\n\n\n {\n\n\n  \n \"\ntitle\n\":\n \"\nAPI\n Integr\nation\n for\n Drag\n and\n Drop\n\",\n\n\n  \n \"\ndescription\n\":\n \"\nIntegr\nate\n the\n drag\n and\n drop\n functionality\n with\n the\n API\n to\n enable\n se\nam\nless\n communication\n between\n the\n front\nend\n and\n backend\n.\",\n\n\n  \n \"\ndue\n_\ndate\n\":\n \"\n2\n0\n2\n3\n-\n0\n8\n-\n1\n8\n\",\n\n\n  \n \"\ntags\n\":\n [\"\nAPI\n integration\n\",\n \"\ndrag\n and\n drop\n functionality\n\",\n \"\nbackend\n development\n\"]\n\n\n\n },\n\n\n\n {\n\n\n  \n \"\ntitle\n\":\n \"\nTest\ning\n and\n Debug\nging\n for\n Drag\n and\n Drop\n\",\n\n\n  \n \"\ndescription\n\":\n \"\nTest\n and\n debug\n the\n implemented\n drag\n and\n drop\n functionality\n to\n ensure\n it\n works\n correctly\n and\n fixes\n any\n issues\n that\n arise\n.\",\n\n\n  \n \"\ndue\n_\ndate\n\":\n \"\n2\n0\n2\n3\n-\n0\n9\n-\n0\n1\n\",\n\n\n  \n \"\ntags\n\":\n [\"\ntesting\n and\n debugging\n\",\n \"\ndrag\n and\n drop\n functionality\n\",\n \"\nbackend\n development\n\"]\n\n\n\n }\n\n\n]\n\n\n\n\nNote\n:\n The\n due\n dates\n are\n based\n on\n the\n assumption\n that\n the\n task\n starts\n on\n August\n \n1\n1\n,\n \n2\n0\n2\n3\n.\n";
    
        return $this->parseSubtaskResponse($response);
    }
}