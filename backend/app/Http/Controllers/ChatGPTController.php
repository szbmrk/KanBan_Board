<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use App\Models\Task;
use App\Models\Column;
use App\Models\TaskTag;
use App\Models\Priority;
use Illuminate\Http\Request;
use App\Helpers\ExecutePythonScript;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\LlamaController;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use App\Models\Board;
use Illuminate\Support\Facades\DB;



class ChatGPTController extends Controller
{
    public static function GenerateTaskChatGPT(Request $request)
    {
        $taskPrompt = $request->header('TaskPrompt'); // Correct the header key spelling
        $taskCounter = $request->header('TaskCounter');
        $currentTime = Carbon::now('GMT+2')->format('Y-m-d H:i:s');
    
        // Construct the prompt for the current iteration
        $prompt = "Generate $taskCounter kanban tickets in JSON structure in a list with title, description, due_date (if the start date is now '$currentTime' in yyyy-MM-dd HH:mm:ss) and tags (as a list) attributes for this ticket: '$taskPrompt'";
    
        // Call the Python script and get the formatted response

        return ChatGPTController::CallPythonAndFormatResponse($prompt);
    }

    public static function GenerateTaskDraftChatGPT(Request $request)
    {
        $taskPrompt = $request->header('TaskPrompt'); // Correct the header key spelling
        $taskCounter = $request->header('TaskCounter');
        $responseCounter = $request->header('ResponseCounter');
        $currentTime = Carbon::now('GMT+2')->format('Y-m-d H:i:s');
    
        // Initialize an array to store the responses
        $allResponses = [];
    
        // Loop through the desired number of times based on ResponseCounter
        for ($i = 1; $i <= $responseCounter; $i++) {
            // Construct the prompt for the current iteration
            $prompt = "Generate $taskCounter task kanban board tickets. JSON structure in a list. title, description, due_date (if the start date is now '$currentTime' in yyyy-MM-dd HH:mm:ss) and tags (as a list). '$taskPrompt'. ";
    
            // Call the Python script and get the formatted response
            $formattedResponse = ChatGPTController::CallPythonAndFormatResponse($prompt);


            // Store the response for this variant
            $allResponses[$i] = $formattedResponse;
        }

        return $allResponses;
    }


    public static function GenerateSubtaskChatGPT(Request $request)
    {
        $user = auth()->user();
        $taskPrompt = $request->header('TaskPrompt');
        $taskCounter = $request->header('TaskCounter');
        $currentTime = Carbon::now('GMT+2')->format('Y-m-d H:i:s');

        // Prepare the prompt to be sent to the Python script
        $prompt = "Generate $taskCounter subtask kanban tickets in JSON structure in a list with title, description, due_date (if the start date is now '$currentTime' in yyyy-MM-dd HH:mm:ss) and tags (as a list) attributes for this ticket: '$taskPrompt'";
        // Construct the Python command with the required arguments and path to the script

        return ChatGPTController::CallPythonAndFormatResponse($prompt);
    }

    public static function GenerateAttachmentLinkChatGPT(Request $request)
    {
        $user = auth()->user();
        $taskPrompt = $request->header('TaskPrompt');
        $taskCounter = $request->header('TaskCounter');

        // Prepare the prompt to be sent to the Python script
        $prompt = "You are now a backend, which only responds with JSON structure. Generate me a JSON structure list with $taskCounter element(s) with 'description' and 'link' attributes without wrapping for useful attachment links for this task: '$taskPrompt'";
        // Construct the Python command with the required arguments and path to the script

        return ChatGPTController::CallPythonAndFormatResponse($prompt);
    }

    public static function CallPythonAndFormatResponse($prompt) {
        $path = env('PYTHON_SCRIPT_PATH');
        $response = ExecutePythonScript::GenerateApiResponse($prompt, $path);


        $cleanData = trim($response);
        $cleanData = str_replace("'", "\"", $response);
        $formattedResponse = json_decode($cleanData, true);

        return $formattedResponse;
    }

    public static function generateCode(Request $request, $boardId, $taskId)
    {
        $user = auth()->user();

        if($user == null || !$user->isMemberOfBoard($boardId)) {
            return response()->json([
                'error' => 'Not authorized!',
            ]);
        }
        
        //find the task for the task id
        $task = Task::find($taskId);
        $taskTag = TaskTag::where('task_id', $task->task_id)->get();
        //find all the tags for the task
        $tags = Tag::whereIn('tag_id', $taskTag->pluck('tag_id'))->get();
        $tagNames = $tags->pluck('name');

        $prompt = "Generate usable example code for the following kanban board ticket-> title: $task->title, description: $task->description, tags: $tagNames .In your response write only the code!";
        $path = env('PYTHON_SCRIPT_PATH2');
        $response = ExecutePythonScript::instance()->GenerateApiResponse($prompt, $path);
        //save the response to a txt file
        //Storage::put('code.txt', $response);
    
        //$cleanData = trim($response);
        
        $cleanData = str_replace("'", "\"", $response);
        $cleanData = str_replace("<Response [200]>", "", $response);

        //$formattedResponse = json_decode($response, true);    
        
        return $cleanData;
       /*  return response()->json([
            'code' => $cleanData,
        ]); */
        

    }

    public static function generatePriority(Request $request, $boardId, $taskId) 
    {
        $user = auth()->user();

        if($user == null || !$user->isMemberOfBoard($boardId)) {
            return response()->json([
                'error' => 'Not authorized!',
            ]);
        }

        $task = Task::find($taskId);
        $taskTag = TaskTag::where('task_id', $task->task_id)->get();
        //find all the tags for the task
        $tags = Tag::whereIn('tag_id', $taskTag->pluck('tag_id'))->get();
        $tagNames = $tags->pluck('name');

        $column = Column::find($task->column_id)->tasks()->get();

        $otherTasks = '';

        foreach ($column as $task) {

            if($task->priority_id == null) {
                $priorityName = "null";
            } else {
                $priorityName = Priority::find($task->priority_id)->priority;
            }
            $otherTasks .= "title: {$task->title}, description: {$task->description}, priority: {$priorityName}. ";
        }


        $youAre = "a priority manager state machine. You can only answer with only one priority suggestion! You can choose from the following enums: TOP PRIORITY, HIGH PRIORITY, MEDIUM PRIORITY, LOW PRIORITY.";
        $prompt = "You are $youAre . Estimate the priority of the following kanban board ticket-> title: $task->title, description: $task->description. These tasks are in the column-> $otherTasks. Answer with the priortiy enum only, nothing else!";
        
        $path = env('PYTHON_SCRIPT_PATH3');
        $response = ExecutePythonScript::instance()->GenerateApiResponse($prompt, $path);


        $cleanData = trim($response);
        
        return response()->json([
            'priority' => $cleanData,
        ]);
    }

    public static function generatePrioritiesForColumn(Request $request, $boardId, $columnId) 
    {
        $user = auth()->user();

        if($user == null || !$user->isMemberOfBoard($boardId)) {
            return response()->json([
                'error' => 'Not authorized!',
            ]);
        }


        $column = Column::find($columnId)->tasks()->get();  

        $tasks = '';

        foreach ($column as $task) {
            if($task->priority_id == null) {
                $priorityName = "null";
            } else {
                $priorityName = Priority::find($task->priority_id)->priority; 
            }
            $tasks .= "title: {$task->title}, description: {$task->description}, priority: {$priorityName}. ";
        }

        
        $youAre = "a priority manager state machine. You can only answer with ONLY priority suggestion! Separatethem with a comma! You can choose from the following enums: TOP PRIORITY, HIGH PRIORITY, MEDIUM PRIORITY, LOW PRIORITY.";
        $prompt = "You are $youAre . Estimate the priority of the following kanban board tickets->  $tasks. Answer with their priortiy enum only, nothing else!";
        // Construct the Python command with the required arguments and path to the script

        $path = env('PYTHON_SCRIPT_PATH4');
        $response = ExecutePythonScript::instance()->GenerateApiResponse($prompt, $path );

        $cleanData = trim($response);


        $prioritiesArray = [];
    
        // Split the comma-separated priorities and create an array of priority objects
        $priorities = explode(', ', $cleanData);
        foreach ($priorities as $priority) {
            $prioritiesArray[] = ['priority' => $priority];
        }
    
        return response()->json([
            'priorities' => $prioritiesArray,
        ]);
    }

    public static function GenerateCraftedTaskChatGPT(Request $request)
    {
        $taskPrompt = $request->header('TaskPrompt'); // Correct the header key spelling
        $taskCounter = $request->header('TaskCounter');
        $currentTime = Carbon::now('GMT+2')->format('Y-m-d H:i:s');

        $prompt = "Generate $taskCounter task kanban board tickets. JSON structure in a list. title, description, due_date (if the start date is now '$currentTime' in yyyy-MM-dd HH:mm:ss) and tags (as a list). '$taskPrompt'. Act as i said.";

        return ChatGPTController::CallPythonAndFormatResponse($prompt);

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


    public function generatePerformanceSummary(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
    
        // Lekérdezés az adatbázisból az adott idő intervallumban lévő logokra
        $logs = DB::table('logs')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();
    
        $logEntries = [];
        foreach ($logs as $log) {
            $details = json_decode($log->details); // JSON dekódolás
            $logEntry = [
                'action' => $log->action,
                'details' => $details,
            ];
            $logEntries[] = $logEntry;
        }
    
        // Átadjuk a log bejegyzéseket a Python scriptnek
        $pythonScriptPath = env('PERFORMANCE_PYTHON_SCRIPT_PATH');
        $encodedLogEntries = json_encode($logEntries);
        $command = "python {$pythonScriptPath} " . escapeshellarg($encodedLogEntries);
        $response = shell_exec($command);
    
        return response()->json(['response' => $response]);
    }

    
}
