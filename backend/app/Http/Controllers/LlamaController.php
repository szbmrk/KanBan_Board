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
        $rawResponse = "\n Sure\n!\n Here\n are\n three\n Kan\nban\n tasks\n for\n the\n \"\nCreate\n drag\n and\n drop\n function\n on\n backend\n\"\n requirement\n,\n generated\n using\n JSON\n structure\n:\n\n\n\n\nTask\n \n1\n:\n\n\nTitle\n:\n Im\nplement\n Drag\n and\n Drop\n Function\nality\n for\n File\n Up\nload\n\n\nDescription\n:\n Create\n a\n drag\n and\n drop\n functionality\n for\n file\n upload\ns\n on\n the\n backend\n,\n allowing\n users\n to\n select\n files\n from\n their\n local\n machine\n and\n upload\n them\n to\n the\n server\n without\n leaving\n the\n application\n.\n\n\nD\nue\n Date\n:\n \n2\n0\n2\n3\n-\n0\n8\n-\n2\n8\n\n\nTags\n:\n @\nbackend\n,\n @\nfile\nupload\n,\n @\ndrag\nand\ndrop\n\n\n\n\nTask\n \n2\n:\n\n\nTitle\n:\n Integr\nate\n Drag\n and\n Drop\n Function\nality\n into\n Ex\nisting\n Back\nend\n Code\n\n\nDescription\n:\n Integr\nate\n the\n drag\n and\n drop\n functionality\n into\n the\n existing\n backend\n code\n,\n ens\nuring\n se\nam\nless\n integration\n and\n minimal\n dis\nruption\n to\n the\n current\n system\n.\n\n\nD\nue\n Date\n:\n \n2\n0\n2\n3\n-\n0\n9\n-\n0\n4\n\n\nTags\n:\n @\nbackend\n,\n @\nintegration\n,\n @\njavascript\n\n\n\n\nTask\n \n3\n:\n\n\nTitle\n:\n Test\n and\n Valid\nate\n Drag\n and\n Drop\n Function\nality\n\n\nDescription\n:\n Thor\nough\nly\n test\n and\n validate\n the\n drag\n and\n drop\n functionality\n to\n ensure\n it\n works\n correctly\n across\n different\n browsers\n and\n devices\n,\n and\n that\n it\n meets\n all\n the\n required\n specific\nations\n.\n\n\nD\nue\n Date\n:\n \n2\n0\n2\n3\n-\n0\n9\n-\n1\n1\n\n\nTags\n:\n @\ntesting\n,\n @\nvalidation\n,\n @\nbrowser\ncompat\nibility\n";
    
        return $this->parseSubtaskResponse($rawResponse);
    }
}