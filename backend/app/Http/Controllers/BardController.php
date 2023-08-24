<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tag;
use App\Models\Task;
use App\Models\Column;
use App\Models\TaskTag;
use App\Models\Priority;
use App\Helpers\ExecutePythonScript;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\LlamaController;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use App\Models\Board;

class BardController extends Controller
{

    public static function generateTaskBard(Request $request)
    {
        $taskPrompt = $request->header('TaskPrompt');
        $taskCounter = $request->header('TaskCounter');
        $currentTime = Carbon::now('GMT+2')->format('Y-m-d H:i:s');

        // API call
        $prompt = "You are now a backend which only respond in JSON stucture. Generate at least $taskCounter kanban tasks in JSON structure in a list with title, description, due_date (if the start date is now '{$currentTime}' in yyyy-mm-dd) and tags (as a list) attributes for this task: $taskPrompt Focus on the tasks and do not write a summary at the end";

        return BardController::CallPythonAndFormatResponse($prompt);
    }


    public static function generateSubtaskBard(Request $request)
    {
        $taskPrompt = $request->header('TaskPrompt');
        $taskCounter = $request->header('TaskCounter');
        $currentTime = Carbon::now('GMT+2')->format('Y-m-d H:i:s');

        // API call
        $prompt = "You are now a backend which only respond in JSON stucture. Generate at least $taskCounter kanban tasks in JSON structure in a list with title, description, due_date (if the start date is now '{$currentTime}' in yyyy-mm-dd) and tags (as a list) attributes for this task: $taskPrompt Focus on the tasks and do not write a summary at the end";

        return BardController::CallPythonAndFormatResponse($prompt);
    }



    public static function parseSubtaskResponse($response)
    {
        preg_match_all('/\{\s*"title":\s*"(.*?)",\s*"description":\s*"(.*?)",\s*"due_date":\s*"(.*?)",\s*"tags":\s*\[(.*?)\]\s*\}/', $response, $matches, PREG_SET_ORDER);
    
        $parsedData = [];
    
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
    
        return $parsedData;
    }

    public static function generateTaskDraftBard(Request $request) 
    {
        $taskPrompt = $request->header('TaskPrompt');
        $taskCounter = $request->header('TaskCounter');
        $responseCounter = $request->header('ResponseCounter');
        $currentTime = Carbon::now('GMT+2')->format('Y-m-d H:i:s');
    
        $prompt = "You are now a backend which only respond in JSON structure. Generate at least $taskCounter kanban tasks in JSON structure in a list with title, description, due_date (if the start date is now '{$currentTime}' in yyyy-mm-dd) and tags (as a list) attributes for this task: $taskPrompt Focus on the tasks and do not write a summary at the end";
    
        $array = BardController::CallPythonAndFormatResponseDraft($prompt, $responseCounter);
        
        return $array;
    }

    public static function parseTaskResponseDraft($response)
    {
        preg_match_all('/\{\s*"title":\s*"(.*?)",\s*"description":\s*"(.*?)",\s*"due_date":\s*"(.*?)",\s*"tags":\s*\[(.*?)\]\s*\}/', $response, $matches, PREG_SET_ORDER);
    
        $parsedData = [];

    
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
    
        return $parsedData;
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
        $path = env('BARD_PYTHON_SCRIPT_PATH');
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
        $path = env('BARD_PYTHON_SCRIPT_PATH');
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
        $path = env('BARD_PYTHON_SCRIPT_PATH');
        $response = ExecutePythonScript::instance()->GenerateApiResponse($prompt, $path);
        $cleanData = trim($response);

        return [
            'response' => $cleanData
        ];
    }

    public static function CallPythonAndFormatResponseDraft($prompt, $responseCounter)
    {
        $pythonScriptPath = env('BARD_PYTHON_SCRIPT_PATH'); // Path to your Python script
        $token = env('BARD_TOKEN'); // Get your Bard token from environment variables
        $token2 = env('BARD_TOKEN2'); // Get your second Bard token from environment variables
        $responseArrays = [];

        for ($i = 1; $i <= $responseCounter; $i++) {
            $command = "python {$pythonScriptPath} \"{$prompt}\" \"{$token}\" \"{$token2}\"";
                $answer = shell_exec($command);
            
                $answer = BardController::parseTaskResponseDraft($answer);
            //  $parsedResponse = json_decode($answer, true); // Parse the JSON response
                $responseArrays[$i] = $answer;
        }
        //dd($responseArrays);

        return $responseArrays;
    }

    public static function CallPythonAndFormatResponse($prompt)
    {
        $pythonScriptPath = env('BARD_PYTHON_SCRIPT_PATH'); // Path to your Python script
        $token = env('BARD_TOKEN'); // Get your Bard token from environment variables
        $token2 = env('BARD_TOKEN2'); // Get your second Bard token from environment variables
        $command = "python {$pythonScriptPath} \"{$prompt}\" \"{$token}\" \"{$token2}\"";
        
        try {
            $answer = shell_exec($command);   
            $parsedData = BardController::parseLinkResponse($answer);
            return response()->json($parsedData);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()]);
        }
    }

    public static function GenerateAttachmentLinkBard($request) 
    {
        $taskPrompt = $request->header('TaskPrompt');
        $taskCounter = $request->header('TaskCounter');
        $currentTime = Carbon::now('GMT+2')->format('Y-m-d H:i:s');

        // API call
        $prompt = "You are now a backend, which only responds with JSON structure. Generate me a JSON structure list with $taskCounter element(s) with 'description' and 'link' attributes without wrapping for useful attachment links for this task: '$taskPrompt'";

        return BardController::CallPythonAndFormatResponse($prompt);
    }

    public static function parseLinkResponse($response)
    {
        preg_match_all('/\{\s*"description":\s*"(.*?)",\s*"link":\s*"(.*?)"\s*\}/s', $response, $matches, PREG_SET_ORDER);
        $parsedData = [];

        foreach ($matches as $match) {
            $description = trim($match[1]);
            $link = trim($match[2]);

            $parsedData[] = [
                "description" => $description,
                "link" => $link
            ];
        }

        return $parsedData;
    }

    public static function GenerateCodeReviewOrDocumentation(Request $request, $boardId, $expectedType) 
    {
        $user = auth()->user();
        if(!$user)
        {
            return response()->json([
                'error' => 'Unauthorized!',
            ]);
        }
        $board = Board::where('board_id', $boardId)->first();


        if (!$board) {
            return response()->json(['error' => 'Board not found.'], 404);
        }

        $team = $board->team;

        if (!$team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(['error' => 'You are not a member of the team.'], 404);
        }

        $code = $request->input('code');
        $promptCodeReview = "Use only UTF-8 chars! In your response use 'Code review:'! Act as a Code reviewer programmer and generate a code review for the following code: '''$code'''. Do NOT send back any code!";
        $promptDocumentation = "Use only UTF-8 chars! Act as an senior programmer and generate a documentation for the following code: '$code'. Do NOT send back any code!";
    
        if ($expectedType === 'Code review') {
            $prompt = $promptCodeReview;
        } elseif ($expectedType === 'Documentation') {
            $prompt = $promptDocumentation;
        } else {
            return response()->json([
                'error' => 'Invalid expected type.',
            ], 400);
        }
    
        return BardController::CallPythonAndFormatCodeReviewOrDocResponse($prompt, $expectedType);
    }
    
    public static function parseCodeReviewResponse($response, $expectedType)
    {
        preg_match('/Code review:(.*)/s', $response, $matches);

        if (isset($matches[1])) {
            $review = trim($matches[1]);
            $review = str_replace("\n", '', $review);
            $review = str_replace("*", '', $review);
    
            return [
                "expectedType" => $expectedType,
                "review" => $review,
            ];
        }

        return null;
    }

    public static function CallPythonAndFormatCodeReviewOrDocResponse($prompt, $expectedType)
    {
        $pythonScriptPath = env('BARD_PYTHON_SCRIPT_PATH_CODE_REVIEW_AND_DOCUMENTATION'); // Path to your Python script
        $token = env('BARD_TOKEN'); // Get your Bard token from environment variables
        $token2 = env('BARD_TOKEN2'); // Get your second Bard token from environment variables
        $command = "python {$pythonScriptPath} \"{$prompt}\"";

                
        try {
            $answer = shell_exec($command); 
            if($expectedType === 'Code review') 
                $parsedData = BardController::parseCodeReviewResponse($answer, $expectedType);
            if($expectedType === 'Documentation') 
                $parsedData = BardController::parseDocResponse($answer);
            return $parsedData;
        } catch (\Exception $e) {
            \Log::error('Error executing shell command: ' . $e->getMessage());

            return response()->json(['error' => $e->getMessage()]);
        }
    }
}
