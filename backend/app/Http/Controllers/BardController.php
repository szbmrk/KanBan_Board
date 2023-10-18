<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use App\Models\Task;
use App\Models\Board;
use App\Models\Column;
use App\Models\TaskTag;
use App\Models\Priority;
use App\Models\AGIAnswers;
use App\Models\AgiBehavior;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use App\Helpers\ExecutePythonScript;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\LlamaController;
use Illuminate\Support\Facades\DB;


class BardController extends Controller
{

    public static function generateTaskBard(Request $request, $craftedPrompt)
    {
        
        $prompt = BardController::AssemblyPrompt($request, $craftedPrompt);

        return BardController::CallPythonAndFormatResponse($prompt);
    }

    public static function AssemblyPrompt($request, $craftedPrompt) 
    {

        if(!$craftedPrompt) 
        {
            $taskPrompt = $request->header('TaskPrompt');
            $taskCounter = $request->header('TaskCounter');
            $behavior = "";
        }
        else
        {
            $taskPrompt = $craftedPrompt->crafted_prompt_text;
            $taskCounter = $craftedPrompt->response_counter;
            $behavior = AgiBehavior::where('agi_behavior_id', $craftedPrompt->agi_behavior_id)->first();
            if(!$behavior) 
            {
                $behavior = "";
            }
            else 
            {
                $behavior = $behavior->act_as_a;
                $behavior = "In your response act as a $behavior!!";
            }

            if($craftedPrompt->action == "GENERATEATTACHMENTLINK") 
            {
                $prompt = "You are now a backend, which only responds with JSON structure. $behavior Generate me a JSON structure list with $taskCounter element(s) with 'description' and 'link' attributes without wrapping for useful attachment links for this task: '$taskPrompt'";
                return $prompt;
            }
                
        }
        
        $currentTime = Carbon::now('GMT+2')->format('Y-m-d H:i:s');

        $prompt = "You are now a backend which only respond in JSON stucture. $behavior Generate at least $taskCounter kanban tasks in JSON structure in a list with title, description, due_date (if the start date is now '{$currentTime}' in yyyy-mm-dd) and tags (as a list) attributes for this task: $taskPrompt Focus on the tasks and do not write a summary at the end";

        return $prompt;
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


    public static function GenerateTaskDocumentationPerTask($boardId, $taskId)
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
        $token = env('BARD_TOKEN'); // Get your Bard token from environment variables
        $token2 = env('BARD_TOKEN2'); // Get your second Bard token from environment variables
        $command = "python {$path} \"{$prompt}\" \"{$token}\" \"{$token2}\"";
        $response = shell_exec($command);
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
        $token = env('BARD_TOKEN'); // Get your Bard token from environment variables
        $token2 = env('BARD_TOKEN2'); // Get your second Bard token from environment variables
        $command = "python {$path} \"{$prompt}\" \"{$token}\" \"{$token2}\"";
        $response = shell_exec($command);
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
        $token = env('BARD_TOKEN'); // Get your Bard token from environment variables
        $token2 = env('BARD_TOKEN2'); // Get your second Bard token from environment variables
        $command = "python {$path} \"{$prompt}\" \"{$token}\" \"{$token2}\"";
        $response = shell_exec($command);
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
            $parsedData = BardController::parseTaskResponseDraft($answer);
            return response()->json($parsedData);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()]);
        }
    }

    public static function CallPythonAndFormatResponseAttachment($prompt)
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

    public static function GenerateAttachmentLinkBard($request, $craftedPrompt) 
    {  
        $prompt = BardController::AssemblyPrompt($request, $craftedPrompt);

        if(!$craftedPrompt) {
            $taskPrompt = $request->header('TaskPrompt');
            $taskCounter = $request->header('TaskCounter');
            $prompt = "You are now a backend, which only responds with JSON structure. Generate me a JSON structure list with $taskCounter element(s) with 'description' and 'link' attributes without wrapping for useful attachment links for this task: '$taskPrompt'";
        }

        return BardController::CallPythonAndFormatResponseAttachment($prompt);
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

        //get the code from the request body

        $code = $request->input('code');        
        $promptCodeReview = "Use only UTF-8 chars! In your response use 'Code review:'! Act as a Code reviewer programmer and generate a code review for the following code: '''$code'''. Do NOT send back any code!";
        $promptDocumentation = "Use only UTF-8 chars! In your response use 'Documentation:'! Act as an senior programmer and generate a documentation for the following code: '$code'. Do NOT send back any code!";
    
        if ($expectedType === 'Code review') {
            $prompt = $promptCodeReview;
        } elseif ($expectedType === 'Documentation') {
            $prompt = $promptDocumentation;
        } else {
            return response()->json([
                'error' => 'Invalid expected type.',
            ], 400);
        }
    
        return BardController::CallPythonAndFormatCodeReviewOrDocResponse($prompt, $boardId, $expectedType, $code);
    }

    public static function parseResponse($response)
    {
        $cleanData = trim($response);
        $cleanData = str_replace("'", "\"", $response);
        $cleanData = str_replace("\n", "", $cleanData);

        return $cleanData;
    }

    public static function CallPythonAndFormatCodeReviewOrDocResponse($prompt, $boardId, $expectedType, $code)
    {
        $pythonScriptPath = env('BARD_PYTHON_SCRIPT_PATH_CODE_REVIEW_AND_DOCUMENTATION'); // Path to your Python script
        $command = "python {$pythonScriptPath} \"{$prompt}\"";

        try {
            $answer = shell_exec($command);

            $parsedData = BardController::parseResponse($answer);

            $user = auth()->user();
            $board = Board::where('board_id', $boardId)->first();
            $chosenAI = request()->header('ChosenAI');
            
            $agiAnswerId = request()->header('agi_answer_id');
        
            if (!empty($agiAnswerId)) {
                $agiAnswer = AGIAnswers::where('board_id', $board->board_id)
                                    ->where('user_id', $user->user_id)
                                    ->where('agi_answer_id', $agiAnswerId)
                                    ->first();
        
                    if ($agiAnswer) {
                        $agiAnswer->chosenAI = $chosenAI;
                        $agiAnswer->codeReviewOrDocumentationType = $expectedType;
                        $agiAnswer->codeReviewOrDocumentation = $parsedData;
                        $agiAnswer->codeReviewOrDocumentationText = $code;
                
                        $agiAnswer->save();
                    } else {
                        return response()->json([
                            'error' => 'AGI answer not found.',
                        ], 404);
                    }
                } else {
                    $agiAnswer = new AGIAnswers([
                        'chosenAI' => $chosenAI,
                        'codeReviewOrDocumentationType' => $expectedType,
                        'codeReviewOrDocumentation' => $parsedData,
                        'codeReviewOrDocumentationText' => $code,
                        'board_id' => $board->board_id,
                        'user_id' => $user->user_id,
                    ]);
                
            
                    $agiAnswer->save();
                }
            
                
            $response = response()->json([
                'reviewType' => $expectedType,
                'review' => $parsedData,
            ]);

            return $response;
        } catch (\Exception $e) {
            Log::error('Error executing shell command: ' . $e->getMessage());

            return response()->json(['error' => $e->getMessage()]);
        }
    }

    public static function generatePerformanceSummary(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $boardId = $request->input('board_id');

        $logsQuery = DB::table('logs')->select('action', 'details', 'created_at', 'task_id')->whereBetween('created_at', [$startDate, $endDate]);
        if ($boardId) {
            $logsQuery->where('board_id', $boardId);
        }

        $logs = $logsQuery->get();

        if (!$logs->count()) {
            return response()->json(['error' => 'No logs found for the specified board_id and date range']);
        }

        $logEntries = [];
        $tasksCreatedCount = 0;
        $tasksFinishedCount = 0;

        $finishedTasksSet = [];
        $revertedTasksSet = [];

        foreach ($logs as $log) {
            $detailText = $log->details;
            $logEntry = "On {$log->created_at}, {$log->action}, {$detailText}";
            $logEntries[] = $logEntry;

            if ($log->action == 'CREATED TASK') {
                $tasksCreatedCount++;
            }

            if ($log->action == 'FINISHED TASK' && !in_array($log->task_id, $finishedTasksSet)) {
                $tasksFinishedCount++;
                $finishedTasksSet[] = $log->task_id;
            }

            if ($log->action == 'REVERTED FINISHED TASK' && in_array($log->task_id, $finishedTasksSet) && !in_array($log->task_id, $revertedTasksSet)) {
                $tasksFinishedCount--;
                $revertedTasksSet[] = $log->task_id;
            }
        }

        $formattedLogs = implode("; ", $logEntries);
        $prompt = "Based on the following log entries in a Kanban table: {$formattedLogs}, create a performance review by day and point out the most and least productive days.";

        $path = env('BARD_PYTHON_SCRIPT_PATH');
        $token = env('BARD_TOKEN'); // Get your Bard token from environment variables
        $token2 = env('BARD_TOKEN2'); // Get your second Bard token from environment variables
        $command = "python {$path} \"{$prompt}\" \"{$token}\" \"{$token2}\"";
        $response = shell_exec($command);
        $response = trim($response);

        $responseSummary = "\n\nSummary for the time between dates: Total tasks created: {$tasksCreatedCount}. Total tasks finished: {$tasksFinishedCount}.";
        $response .= $responseSummary;

        DB::table('summary_logs')->insert([
            'start_date' => $startDate,
            'end_date' => $endDate,
            'summary' => $response,
            'tasks_created_count' => $tasksCreatedCount,
            'tasks_finished_count' => $tasksFinishedCount,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json(['response' => $response]);
    }
}
