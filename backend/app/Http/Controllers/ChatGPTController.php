<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use App\Models\Task;
use App\Models\Board;
use App\Models\Column;
use App\Models\TaskTag;
use App\Models\Priority;
use App\Models\AGIAnswers;
use App\Models\SummaryLog;
use App\Models\AgiBehavior;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Helpers\ExecutePythonScript;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Illuminate\Exception;

class ChatGPTController extends Controller
{
    public static function GenerateTaskChatGPT($request, $craftedPrompt)
    {
        $prompt = self::PromptAssembly($request, $craftedPrompt);

        return self::CallPythonAndFormatResponse($prompt);
    }

    public static function PromptAssembly($request, $craftedPrompt)
    {
        if (!$craftedPrompt) {
            $taskPrompt = $request->header('TaskPrompt');
            $taskCounter = $request->header('TaskCounter');
            $behavior = "";
        } else {
            $taskPrompt = $craftedPrompt->crafted_prompt_text;
            $taskCounter = $craftedPrompt->response_counter;
            $behavior = AgiBehavior::where('agi_behavior_id', $craftedPrompt->agi_behavior_id)->first();
            if (!$behavior) {
                $behavior = "";
            } else {
                $behavior = $behavior->act_as_a;
                $behavior = "You are now a $behavior, act like it!!";
            }

            if ($craftedPrompt->action == "GENERATEATTACHMENTLINK") {
                $prompt = "You are now a backend, which only responds within a valid JSON structure as an array. Generate me a JSON structure list with $taskCounter element(s) with 'description' and 'link' attributes without wrapping for useful attachment links for this task: '$taskPrompt'";
                return $prompt;

            }

        }
        $currentTime = Carbon::now('GMT+2')->format('Y-m-d H:i:s');


        // Construct the prompt for the current iteration
        $prompt = "$behavior You are now a backend that generates valid JSON responses. Create a JSON structure containing exactly $taskCounter kanban tickets. Each ticket must include:'title' (a string), 'description' (a string), 'due_date' (a string in the format 'yyyy-MM-dd HH:mm:ss', assuming the current start date is '$currentTime') and 'tags' (an array of strings with at least one tag) for this ticket: '$taskPrompt'.The output must be wrapped inside an object with a key called tasks. Ensure the output is valid JSON, properly formatted, and contains no escaped characters or additional formatting. Do not return the JSON as a string or include backslashes. Return only valid JSON data.";

        return $prompt;

    }

    public static function GenerateAttachmentLinkNotCraftedChatGPT($request)
    {
        $taskPrompt = $request->header('TaskPrompt');
        $taskCounter = $request->header('TaskCounter');

        $prompt = "You are now a backend, which only responds with JSON structure. Generate me a JSON structure list with $taskCounter element(s) with 'description' and 'link' attributes without wrapping for useful attachment links for this task: '$taskPrompt'";

        return self::CallPythonAndFormatResponse($prompt);


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
            $prompt = "You are now a backend that generates valid JSON responses. Create a JSON structure containing exactly $taskCounter kanban tickets. Each ticket must include:'title' (a string), 'description' (a string), 'due_date' (a string in the format 'yyyy-MM-dd HH:mm:ss', assuming the current start date is '$currentTime') and 'tags' (an array of strings with at least one tag) for this ticket: '$taskPrompt'.The output must be wrapped inside an object with a key called tasks. Ensure the output is valid JSON, properly formatted, and contains no escaped characters or additional formatting. Do not return the JSON as a string or include backslashes. Return only valid JSON data.";

            // Call the Python script and get the formatted response
            $formattedResponse = self::CallPythonAndFormatResponse($prompt);


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
        $prompt = "You are now a backend that generates valid JSON responses. Create a JSON structure containing exactly $taskCounter kanban tickets. Each ticket must include:'title' (a string), 'description' (a string), 'due_date' (a string in the format 'yyyy-MM-dd HH:mm:ss', assuming the current start date is '$currentTime') and 'tags' (an array of strings with at least one tag) for this ticket: '$taskPrompt'.The output must be wrapped inside an object with a key called tasks. Ensure the output is valid JSON, properly formatted, and contains no escaped characters or additional formatting. Do not return the JSON as a string or include backslashes. Return only valid JSON data.";
        // Construct the Python command with the required arguments and path to the script

        return self::CallPythonAndFormatResponse($prompt);
    }

    public static function GenerateAttachmentLinkChatGPT($request, $promptCraft)
    {
        $user = auth()->user();

        $prompt = self::PromptAssembly($request, $promptCraft);

        return self::CallPythonAndFormatResponse($prompt);
    }

    public static function CallPythonAndFormatResponse($prompt)
    {
        try {
            $path = config('agiconfig.PYTHON_SCRIPT_PATH');
            $response = ExecutePythonScript::GenerateApiResponse($prompt, $path);
            if (is_array($response) && array_key_exists('error', $response)) {
                return response()->json($response, 500);
            }

            $cleanData = trim($response);
            $cleanData = str_replace("'", "\"", $response);

            $formattedResponse = json_decode($cleanData, true);

            if ($formattedResponse == null || $formattedResponse == "") {
                return response()->json([
                    'error' => 'Content generation failed. Please try again. response: \n'.$response,
                ], 500);
            }

            return $formattedResponse;
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An error occurred: ' . $e->getMessage(),
            ], 500);
        }
    }

    public static function generateCode(Request $request, $boardId, $taskId)
    {
        $user = auth()->user();

        if ($user == null || !$user->isMemberOfBoard($boardId)) {
            return response()->json([
                'error' => 'Not authorized!',
            ], 403);
        }

        //find the task for the task id
        $task = Task::find($taskId);
        $taskTag = TaskTag::where('task_id', $task->task_id)->get();
        //find all the tags for the task
        $tags = Tag::whereIn('tag_id', $taskTag->pluck('tag_id'))->get();
        $tagNames = $tags->pluck('name');

        $prompt = "Generate usable example code for the following kanban board ticket-> title: $task->title, description: $task->description, tags: $tagNames .In your response write only the code!";
        $path = config('agiconfig.PYTHON_SCRIPT_PATH2');
        $response = ExecutePythonScript::instance()->GenerateApiResponse($prompt, $path);
        if (is_array($response) && array_key_exists('error', $response)) {
            return response()->json($response, 500);
        }
        //save the response to a txt file
        //Storage::put('code.txt', $response);

        //$cleanData = trim($response);

        $cleanData = str_replace("'", "\"", $response);
        $cleanData = str_replace("<Response [200]>", "", $response);

        //$formattedResponse = json_decode($response, true);    

        if ($cleanData == null || $cleanData == "") {
            return response()->json([
                'error' => 'Content generation failed. Please try again.',
            ], 500);
        }

        return $cleanData;
        /*  return response()->json([
             'code' => $cleanData,
         ]); */


    }

    public static function generatePriority(Request $request, $boardId, $taskId)
    {
        $user = auth()->user();

        if ($user == null || !$user->isMemberOfBoard($boardId)) {
            return response()->json([
                'error' => 'Not authorized!',
            ], 403);
        }

        $task = Task::find($taskId);
        $taskTag = TaskTag::where('task_id', $task->task_id)->get();
        //find all the tags for the task
        $tags = Tag::whereIn('tag_id', $taskTag->pluck('tag_id'))->get();
        $tagNames = $tags->pluck('name');

        $column = Column::find($task->column_id)->tasks()->get();

        $otherTasks = '';

        foreach ($column as $task) {

            if ($task->priority_id == null) {
                $priorityName = "null";
            } else {
                $priorityName = Priority::find($task->priority_id)->priority;
            }
            $otherTasks .= "title: {$task->title}, description: {$task->description}, priority: {$priorityName}. ";
        }


        $youAre = "a priority manager state machine. You can only answer with only one priority suggestion! You can choose from the following enums: TOP PRIORITY, HIGH PRIORITY, MEDIUM PRIORITY, LOW PRIORITY.";
        $prompt = "You are $youAre . Estimate the priority of the following kanban board ticket-> title: $task->title, description: $task->description. These tasks are in the column-> $otherTasks. Answer with the priortiy enum only, nothing else!";

        $path = config('agiconfig.PYTHON_SCRIPT_PATH3');
        $response = ExecutePythonScript::instance()->GenerateApiResponse($prompt, $path);
        if (is_array($response) && array_key_exists('error', $response)) {
            return response()->json($response, 500);
        }


        $cleanData = trim($response);

        return response()->json([
            'priority' => $cleanData,
        ]);
    }

    public static function generatePrioritiesForColumn(Request $request, $boardId, $columnId)
    {
        $user = auth()->user();

        if ($user == null || !$user->isMemberOfBoard($boardId)) {
            return response()->json([
                'error' => 'Not authorized!',
            ], 403);
        }


        $column = Column::find($columnId)->tasks()->get();

        $tasks = '';

        foreach ($column as $task) {
            if ($task->priority_id == null) {
                $priorityName = "null";
            } else {
                $priorityName = Priority::find($task->priority_id)->priority;
            }
            $tasks .= "title: {$task->title}, description: {$task->description}, priority: {$priorityName}. ";
        }


        $youAre = "a priority manager state machine. You can only answer with ONLY priority suggestion! Separatethem with a comma! You can choose from the following enums: TOP PRIORITY, HIGH PRIORITY, MEDIUM PRIORITY, LOW PRIORITY.";
        $prompt = "You are $youAre . Estimate the priority of the following kanban board tickets->  $tasks. Answer with their priortiy enum only, nothing else!";
        // Construct the Python command with the required arguments and path to the script

        $path = config('agiconfig.PYTHON_SCRIPT_PATH4');
        $response = ExecutePythonScript::instance()->GenerateApiResponse($prompt, $path);
        if (is_array($response) && array_key_exists('error', $response)) {
            return response()->json($response, 500);
        }

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

    public static function GenerateTaskDocumentationPerTask($boardId, $taskId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'error' => 'Unauthorized!',
            ], 403);

        }

        $task = Task::find($taskId);
        if (!$task) {
            return response()->json([
                'error' => 'Task not found!',
            ], 404);
        }
        $board = Board::where('board_id', $boardId)->first();
        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $prompt = "Generate documentation or a longer description for the task with the following title: {$task->title}, description: {$task->description}.";
        $path = config('agiconfig.PYTHON_SCRIPT_PATH');
        $response = ExecutePythonScript::instance()->GenerateApiResponse($prompt, $path);
        if (is_array($response) && array_key_exists('error', $response)) {
            return response()->json($response, 500);
        }
        $cleanData = trim($response);

        return [
            'response' => $cleanData
        ];
    }

    public static function GenerateTaskDocumentationPerBoard($boardId)
    {
        try {

            $user = auth()->user();
            if (!$user) {
                return response()->json([
                    'error' => 'Unauthorized!',
                ], 403);
            }

            $tasks = Task::where('board_id', $boardId)->get();
            if ($tasks->isEmpty()) {
                return response()->json([
                    'error' => 'No tasks found for the given board!',
                ], 404);
            }

            $allTaskDescriptions = '';
            foreach ($tasks as $task) {
                $allTaskDescriptions .= "Task title: {$task->title}, description: {$task->description}. ";
            }

            $prompt = "Generate documentation or a longer description based on the following task titles and descriptions: $allTaskDescriptions";
            $path = config('agiconfig.PYTHON_SCRIPT_PATH');

            $response = ExecutePythonScript::instance()->GenerateApiResponse($prompt, $path);

            if (is_array($response) && array_key_exists('error', $response)) {
                return response()->json($response, 500);
            }

            $cleanData = trim($response);

            return [
                'response' => $cleanData
            ];
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An error occurred: ' . $e->getMessage(),
            ], 500);
        }
    }

    public static function GenerateTaskDocumentationPerColumn($boardId, $columnId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'error' => 'Unauthorized!',
            ], 403);
        }

        $tasks = Task::where('column_id', $columnId)->get();
        if ($tasks->isEmpty()) {
            return response()->json([
                'error' => 'No tasks found for the given column!',
            ], 404);
        }

        $board = Board::where('board_id', $boardId)->first();
        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $allTaskDescriptions = '';
        foreach ($tasks as $task) {
            $allTaskDescriptions .= "Task title: {$task->title}, description: {$task->description}. ";
        }

        $prompt = "Generate documentation or a longer description based on the following task titles and descriptions: $allTaskDescriptions";
        $path = config('agiconfig.PYTHON_SCRIPT_PATH');
        $response = ExecutePythonScript::instance()->GenerateApiResponse($prompt, $path);
        if (is_array($response) && array_key_exists('error', $response)) {
            return response()->json($response, 500);
        }
        $cleanData = trim($response);

        return [
            'response' => $cleanData
        ];
    }

    public static function GenerateCodeReviewOrDocumentation(Request $request, $boardId, $expectedType)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'error' => 'Unauthorized!',
            ], 403);
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
        $promptCodeReview = "Use only UTF-8 chars! In your response use 'Code review:'! Act as a Code reviewer programmer and generate a code review for the following code: '''$code'''.";
        $promptDocumentation = "Use only UTF-8 chars! Act as a senior programmer and generate documentation for the following code: '''$code'''.";

        if ($expectedType === 'Code review') {
            $prompt = $promptCodeReview;
        } elseif ($expectedType === 'Documentation') {
            $prompt = $promptDocumentation;
        } else {
            return response()->json([
                'error' => 'Invalid expected type.',
            ], 400);
        }

        return self::CallPythonAndFormatResponseCodeReviewOrDoc($prompt, $boardId, $expectedType, $code);
    }


    public static function CallPythonAndFormatResponseCodeReviewOrDoc($prompt, $boardId, $expectedType, $code)
    {
        try {
            $path = config('agiconfig.PYTHON_SCRIPT_PATH');
            $response = ExecutePythonScript::GenerateApiResponse($prompt, $path);
            if (is_array($response) && array_key_exists('error', $response)) {
                return response()->json($response, 500);
            }
            $foundKeyPhrase = strtolower($expectedType) . ':';
            $review = substr($response, stripos($response, $foundKeyPhrase) + strlen($foundKeyPhrase));
            $review = trim($review);

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
                    $agiAnswer->codeReviewOrDocumentation = $review;
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
                    'codeReviewOrDocumentation' => $review,
                    'codeReviewOrDocumentationText' => $code,
                    'board_id' => $board->board_id,
                    'user_id' => $user->user_id,
                ]);

                $agiAnswer->save();
            }


            $response = response()->json([
                'reviewType' => $expectedType,
                'review' => $review,
            ]);

            return $response;
        } catch (\Exception $e) {

            return response()->json([
                'error' => 'An error occurred: ' . $e->getMessage(),
            ], 500);
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
            return response()->json(['error' => 'No logs found for the specified board and date range'], 500);
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
        $pythonScriptPath = config('agiconfig.PERFORMANCE_PYTHON_SCRIPT_PATH');
        $response = ExecutePythonScript::instance()->GenerateApiResponse($prompt, $pythonScriptPath);
        if (is_array($response) && array_key_exists('error', $response)) {
            return response()->json($response, 500);
        }
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