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

    public static function CallPythonAndFormatResponse($prompt)
    {
        $pythonScriptPath = env('BARD_PYTHON_SCRIPT_PATH'); // Path to your Python script
        $token = env('BARD_TOKEN'); // Get your Bard token from environment variables
        $token2 = env('BARD_TOKEN2'); // Get your second Bard token from environment variables
        $command = "python {$pythonScriptPath} \"{$prompt}\" \"{$token}\" \"{$token2}\"";
        
        try {
            $answer = shell_exec($command);
            $parsedData = BardController::parseSubtaskResponse($answer);
            return response()->json($parsedData);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()]);
        }
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
