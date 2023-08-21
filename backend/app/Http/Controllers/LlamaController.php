<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Carbon;
use App\Models\Task;
use App\Models\Board;
use App\Helpers\ExecutePythonScript;


class LlamaController extends Controller
{
    public static function generateTaskLlama(Request $request)
    {
        $taskPrompt = $request->header('TaskPrompt');
        $taskCounter = $request->header('TaskCounter');
        $currentTime = Carbon::now('GMT+2')->format('Y-m-d H:i:s');

        // API call
        $prompt = "You are now a backend which only respond in JSON stucture. Generate $taskCounter kanban tasks in JSON structure in a list with title, description, due_date (if the start date is now $currentTime in yyyy-mm-dd) and tags (as a list) attributes for this task: $taskPrompt Focus on the tasks and do not write a summary at the end";
        
        return LlamaController::CallPythonAndFormatResponse($prompt);
    }

    public static function generateSubtaskLlama(Request $request)
    {
        $taskPrompt = $request->header('TaskPrompt');
        $taskCounter = $request->header('TaskCounter');
        $currentTime = Carbon::now('GMT+2')->format('Y-m-d H:i:s');
        
        // API call
        $prompt = "You are now a backend which only respond in JSON stucture. Generate $taskCounter kanban tasks in JSON structure in a list with title, description, due_date (if the start date is now $currentTime in yyyy-mm-dd) and tags (as a list) attributes for this task: $taskPrompt Focus on the tasks and do not write a summary at the end";
        
        return LlamaController::CallPythonAndFormatResponse($prompt);
    }

    public static function GenerateAttachmentLinkLlama(Request $request)
    {
        $user = auth()->user();
        $taskPrompt = $request->header('TaskPrompt');
        $taskCounter = $request->header('TaskCounter');

        // Prepare the prompt to be sent to the Python script
        $prompt = "You are now a backend, which only responds with JSON structure. Generate me a JSON structure list with $taskCounter element(s) with 'description' and 'link' attributes for useful attachment links for this task: '$taskPrompt'";
        // Construct the Python command with the required arguments and path to the script

        return LlamaController::CallPythonAndFormatResponse($prompt);
    }

    public static function CallPythonAndFormatResponse($prompt) {
        $pythonScriptPath = env('LLAMA_PYTHON_SCRIPT_PATH');
        $apiToken = env('REPLICATE_API_TOKEN');
        $command = "set REPLICATE_API_TOKEN={$apiToken} && python {$pythonScriptPath} \"{$prompt}\"";
        
        try {
            $subtaskResponse = shell_exec("{$command} 2>&1");
    
            // Call the parseSubtaskResponse function
            $parsedData = LlamaController::parseSubtaskResponse($subtaskResponse);
    
            // Return both parsed data and raw response for debugging
            return response()->json($parsedData);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()]);
        }
    }

    public static function parseSubtaskResponse($response)
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
    
        return $parsedData;
    }
    
    public static function testSubtaskParsing()
    {
        $response = "\n Sure\n!\n Here\n are\n three\n Kan\nban\n tasks\n in\n JSON\n structure\n based\n on\n the\n task\n \"\nCreate\n drag\n and\n drop\n function\n on\n backend\n\":\n\n\n\n\n[\n\n\n\n {\n\n\n  \n \"\ntitle\n\":\n \"\nDrag\n and\n Drop\n Function\n Im\nplementation\n\",\n\n\n  \n \"\ndescription\n\":\n \"\nIm\nplement\n a\n drag\n and\n drop\n functionality\n on\n the\n backend\n to\n allow\n users\n to\n easily\n upload\n files\n and\n move\n them\n between\n lists\n.\",\n\n\n  \n \"\ndue\n_\ndate\n\":\n \"\n2\n0\n2\n3\n-\n0\n8\n-\n1\n1\n\",\n\n\n  \n \"\ntags\n\":\n [\"\nbackend\n development\n\",\n \"\ndrag\n and\n drop\n functionality\n\",\n \"\nfile\n upload\n\"]\n\n\n\n },\n\n\n\n {\n\n\n  \n \"\ntitle\n\":\n \"\nAPI\n Integr\nation\n for\n Drag\n and\n Drop\n\",\n\n\n  \n \"\ndescription\n\":\n \"\nIntegr\nate\n the\n drag\n and\n drop\n functionality\n with\n the\n API\n to\n enable\n se\nam\nless\n communication\n between\n the\n front\nend\n and\n backend\n.\",\n\n\n  \n \"\ndue\n_\ndate\n\":\n \"\n2\n0\n2\n3\n-\n0\n8\n-\n1\n8\n\",\n\n\n  \n \"\ntags\n\":\n [\"\nAPI\n integration\n\",\n \"\ndrag\n and\n drop\n functionality\n\",\n \"\nbackend\n development\n\"]\n\n\n\n },\n\n\n\n {\n\n\n  \n \"\ntitle\n\":\n \"\nTest\ning\n and\n Debug\nging\n for\n Drag\n and\n Drop\n\",\n\n\n  \n \"\ndescription\n\":\n \"\nTest\n and\n debug\n the\n implemented\n drag\n and\n drop\n functionality\n to\n ensure\n it\n works\n correctly\n and\n fixes\n any\n issues\n that\n arise\n.\",\n\n\n  \n \"\ndue\n_\ndate\n\":\n \"\n2\n0\n2\n3\n-\n0\n9\n-\n0\n1\n\",\n\n\n  \n \"\ntags\n\":\n [\"\ntesting\n and\n debugging\n\",\n \"\ndrag\n and\n drop\n functionality\n\",\n \"\nbackend\n development\n\"]\n\n\n\n }\n\n\n]\n\n\n\n\nNote\n:\n The\n due\n dates\n are\n based\n on\n the\n assumption\n that\n the\n task\n starts\n on\n August\n \n1\n1\n,\n \n2\n0\n2\n3\n.\n";
        
        return LlamaController::parseSubtaskResponse($response);
    }

    public static function GenerateTaskDocumentationPerTask($boardId,$taskId)
    {
        $user = auth()->user();
        if(!$user){
            return response()->json([
                'error' => 'Unauthorized!',
            ]);
        }

        $task = Task::find($taskId);
        if(!$task){
            return response()->json([
                'error' => 'Task not found!',
            ]);
        }
        $board = Board::where('board_id', $boardId)->first();
        if (!$board->team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }
        
        $prompt = "Generate documentation or a longer description for the task with the following title: {$task->title}, description: {$task->description}.";
        $path = env('PYTHON_SCRIPT_PATH');
        $response = ExecutePythonScript::instance()->GenerateApiResponse($prompt, $path);
        $cleanData = trim($response);

        return [
            'response' => $cleanData
        ];
    }

    public static function GenerateTaskDocumentationPerBoard($boardId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'error' => 'Unauthorized!',
            ]);
        }

        $tasks = Task::where('board_id', $boardId)->get();
        if ($tasks->isEmpty()) {
            return response()->json([
                'error' => 'No tasks found for the given board!',
            ]);
        }

        $allTaskDescriptions = '';
        foreach ($tasks as $task) {
            $allTaskDescriptions .= "Task title: {$task->title}, description: {$task->description}. ";
        }

        $prompt = "Generate documentation or a longer description based on the following task titles and descriptions: $allTaskDescriptions";
        $path = env('PYTHON_SCRIPT_PATH');
        $response = ExecutePythonScript::instance()->GenerateApiResponse($prompt, $path);
        $cleanData = trim($response);

        return [
            'response' => $cleanData
        ];
    }

    public static function GenerateTaskDocumentationPerColumn($boardId, $columnId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'error' => 'Unauthorized!',
            ]);
        }

        $tasks = Task::where('column_id', $columnId)->get();
        if ($tasks->isEmpty()) {
            return response()->json([
                'error' => 'No tasks found for the given column!',
            ]);
        }

        $board = Board::where('board_id', $boardId)->first();
        if (!$board->team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $allTaskDescriptions = '';
        foreach ($tasks as $task) {
            $allTaskDescriptions .= "Task title: {$task->title}, description: {$task->description}. ";
        }

        $prompt = "Generate documentation or a longer description based on the following task titles and descriptions: $allTaskDescriptions";
        $path = env('PYTHON_SCRIPT_PATH');
        $response = ExecutePythonScript::instance()->GenerateApiResponse($prompt, $path);
        $cleanData = trim($response);

        return [
            'response' => $cleanData
        ];
    }
}