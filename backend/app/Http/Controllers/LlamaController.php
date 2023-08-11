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
        $prompt = "As a backend developer generate at least 3 kanban tasks in JSON structure in a list with title, description, due_date (if the start date is now '{$formattedDate}' in yyyy-mm-dd) and tags (as a list) attributes for this task: '{$task}' Focus on the tasks and do not write a summary at the end";
        
        $pythonScriptPath = env('LLAMA_PYTHON_SCRIPT_PATH');
        $apiToken = env('REPLICATE_API_TOKEN');
        $command = "set REPLICATE_API_TOKEN={$apiToken} && python {$pythonScriptPath} \"{$prompt}\"";
        
        try {
            $subtaskResponse = shell_exec("{$command} 2>&1");
    
            $parsedData = $this->parseSubtaskResponse($subtaskResponse);
        
            return response()->json($parsedData);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()]);
        }
    }

    public function parseSubtaskResponse($response)
    {
        // Remove newline characters and backslashes
        $response = str_replace(["\n", "\\"], "", $response);
    
        // Initialize an array to hold parsed data
        $parsedData = [];
    
        // Define the pattern to match each task
        preg_match_all('/\{\s*"title":\s*"(.*?)",\s*"description":\s*"(.*?)",\s*"due_date":\s*"(.*?)",\s*"tags":\s*\[(.*?)\]\s*\}/', $response, $matches, PREG_SET_ORDER);
    
        foreach ($matches as $match) {
            $task = [
                "title" => $match[1],
                "description" => $match[2],
                "due_date" => $match[3],
                "tags" => array_map('trim', explode(",", str_replace('"', '', $match[4])))
            ];
    
            $parsedData[] = $task;
        }
    
        return response()->json($parsedData);
    }
    
    public function testSubtaskParsing()
    {
        $response = "\n Sure\n!\n Here\n are\n three\n Kan\nban\n tasks\n in\n JSON\n structure\n based\n on\n the\n task\n \"\nCreate\n drag\n and\n drop\n function\n on\n backend\n\":\n\n\n\n\n[\n\n\n\n {\n\n\n  \n \"\ntitle\n\":\n \"\nDrag\n and\n Drop\n Function\n Im\nplementation\n\",\n\n\n  \n \"\ndescription\n\":\n \"\nIm\nplement\n a\n drag\n and\n drop\n functionality\n on\n the\n backend\n to\n allow\n users\n to\n easily\n upload\n files\n and\n move\n them\n between\n lists\n.\",\n\n\n  \n \"\ndue\n_\ndate\n\":\n \"\n2\n0\n2\n3\n-\n0\n8\n-\n1\n1\n\",\n\n\n  \n \"\ntags\n\":\n [\"\nbackend\n development\n\",\n \"\ndrag\n and\n drop\n functionality\n\",\n \"\nfile\n upload\n\"]\n\n\n\n },\n\n\n\n {\n\n\n  \n \"\ntitle\n\":\n \"\nAPI\n Integr\nation\n for\n Drag\n and\n Drop\n\",\n\n\n  \n \"\ndescription\n\":\n \"\nIntegr\nate\n the\n drag\n and\n drop\n functionality\n with\n the\n API\n to\n enable\n se\nam\nless\n communication\n between\n the\n front\nend\n and\n backend\n.\",\n\n\n  \n \"\ndue\n_\ndate\n\":\n \"\n2\n0\n2\n3\n-\n0\n8\n-\n1\n8\n\",\n\n\n  \n \"\ntags\n\":\n [\"\nAPI\n integration\n\",\n \"\ndrag\n and\n drop\n functionality\n\",\n \"\nbackend\n development\n\"]\n\n\n\n },\n\n\n\n {\n\n\n  \n \"\ntitle\n\":\n \"\nTest\ning\n and\n Debug\nging\n for\n Drag\n and\n Drop\n\",\n\n\n  \n \"\ndescription\n\":\n \"\nTest\n and\n debug\n the\n implemented\n drag\n and\n drop\n functionality\n to\n ensure\n it\n works\n correctly\n and\n fixes\n any\n issues\n that\n arise\n.\",\n\n\n  \n \"\ndue\n_\ndate\n\":\n \"\n2\n0\n2\n3\n-\n0\n9\n-\n0\n1\n\",\n\n\n  \n \"\ntags\n\":\n [\"\ntesting\n and\n debugging\n\",\n \"\ndrag\n and\n drop\n functionality\n\",\n \"\nbackend\n development\n\"]\n\n\n\n }\n\n\n]\n\n\n\n\nNote\n:\n The\n due\n dates\n are\n based\n on\n the\n assumption\n that\n the\n task\n starts\n on\n August\n \n1\n1\n,\n \n2\n0\n2\n3\n.\n";
    
        return $this->parseSubtaskResponse($response);
    }
}