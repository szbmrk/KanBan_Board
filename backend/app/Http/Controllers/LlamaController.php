<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Carbon;
use App\Models\Task;
use App\Models\Board;
use App\Helpers\ExecutePythonScript;
use App\Models\AGIAnswers;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\LlamaController;
use Illuminate\Validation\ValidationException;
use Illuminate\Exception;

class LlamaController extends Controller
{
    public static function generateTaskLlama(Request $request)
    {
        $taskPrompt = $request->header('TaskPrompt');
        $taskCounter = $request->header('TaskCounter');
        $currentTime = Carbon::now('GMT+2')->format('Y-m-d H:i:s');

        // API call
        $prompt = "You are now a backend which only respond in JSON stucture. Generate $taskCounter kanban tasks in JSON structure in a list with title, description, due_date (if the start date is now $currentTime in yyyy-mm-dd) and tags (as a list) attributes for this task: $taskPrompt Focus on the tasks and do not write a summary at the end";

        return response()->json(self::parseSubtaskResponse(self::CallPythonAndFormatResponse($prompt)));
    }

    public static function generateSubtaskLlama(Request $request)
    {
        $taskPrompt = $request->header('TaskPrompt');
        $taskCounter = $request->header('TaskCounter');
        $currentTime = Carbon::now('GMT+2')->format('Y-m-d H:i:s');

        // API call
        $prompt = "You are now a backend which only respond in JSON stucture. Generate $taskCounter kanban tasks in JSON structure in a list with title, description, due_date (if the start date is now $currentTime in yyyy-mm-dd) and tags (as a list) attributes for this task: $taskPrompt Focus on the tasks and do not write a summary at the end";

        return response()->json(self::parseSubtaskResponse(self::CallPythonAndFormatResponse($prompt)));
    }

    public static function GenerateAttachmentLinkLlama(Request $request)
    {
        $user = auth()->user();
        $taskPrompt = $request->header('TaskPrompt');
        $taskCounter = $request->header('TaskCounter');

        // Prepare the prompt to be sent to the Python script
        $prompt = "You are now a backend, which only responds with JSON structure. Generate me a JSON structure list with $taskCounter element(s) with 'description' and 'link' attributes for useful attachment links for this task: '$taskPrompt'";
        // Construct the Python command with the required arguments and path to the script

        $result = self::parseAttachmentLinkResponse(self::CallPythonAndFormatResponse($prompt));

        return $result;
    }

    public static function parseAttachmentLinkResponse($response)
    {

        $cleanData = trim($response);
        $cleanData = str_replace("'", "\"", $cleanData);
        $cleanData = str_replace("\n", "", $cleanData);

        $startPos = strpos($cleanData, '[');
        $endPos = strpos($cleanData, ']');

        $cutString = "[]";

        if ($startPos !== false && $endPos !== false) {
            $cutString = substr($cleanData, $startPos, $endPos - $startPos + 1);
        }

        $formattedResponse = json_decode($cutString, true);

        return $cutString;
    }

    public static function CallPythonAndFormatResponse($prompt)
    {
        $pythonScriptPath = env('LLAMA_PYTHON_SCRIPT_PATH');
        $apiToken = env('REPLICATE_API_TOKEN');
        $command = "set REPLICATE_API_TOKEN={$apiToken} && python {$pythonScriptPath} \"{$prompt}\"";

        try {
            $subtaskResponse = shell_exec("{$command} 2>&1");

            // Call the parseSubtaskResponse function

            // Return both parsed data and raw response for debugging
            return $subtaskResponse;
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

        return self::parseSubtaskResponse($response);
    }

    public static function GenerateTaskDocumentationPerTask($boardId, $taskId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'error' => 'Unauthorized!',
            ]);
        }

        $task = Task::find($taskId);
        if (!$task) {
            return response()->json([
                'error' => 'Task not found!',
            ]);
        }
        $board = Board::where('board_id', $boardId)->first();
        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $prompt = "Generate documentation or a longer description for the task with the following title: {$task->title}, description: {$task->description}.";
        $path = env('LLAMA_PYTHON_SCRIPT_PATH');
        $response = ExecutePythonScript::instance()->GenerateApiResponse($prompt, $path);
        $cleanData = trim($response);
        $cleanData = self::parseResponse($cleanData);

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
        $path = env('LLAMA_PYTHON_SCRIPT_PATH');
        $response = ExecutePythonScript::instance()->GenerateApiResponse($prompt, $path);
        $cleanData = trim($response);
        $cleanData = self::parseResponse($cleanData);

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
        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $allTaskDescriptions = '';
        foreach ($tasks as $task) {
            $allTaskDescriptions .= "Task title: {$task->title}, description: {$task->description}. ";
        }

        $prompt = "Generate documentation or a longer description based on the following task titles and descriptions: $allTaskDescriptions";
        $path = env('LLAMA_PYTHON_SCRIPT_PATH');
        $response = ExecutePythonScript::instance()->GenerateApiResponse($prompt, $path);
        $cleanData = trim($response);
        $cleanData = self::parseResponse($cleanData);

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

        if ($expectedType === 'Code review') {
            $prompt = "Use only UTF-8 chars! In your response use 'Code review:'! Act as a Code reviewer programmer and generate a code review for the following code: '''$code'''. Do NOT send back any code!";
        } elseif ($expectedType === 'Documentation') {
            $prompt = "Use only UTF-8 chars! In your response use 'Documentation:'! Act as a senior programmer and generate a documentation for the following code: '''$code'''. Do NOT send back any code!";
        } else {
            return response()->json([
                'error' => 'Invalid expected type.',
            ], 400);
        }

        return self::CallPythonAndFormatCodeReviewOrDocResponse($prompt, $boardId, $expectedType, $code);
    }


    public static function CallPythonAndFormatCodeReviewOrDocResponse($prompt, $boardId, $expectedType, $code)
    {
        try {
            $answer = self::CallPythonAndFormatResponse($prompt);
            dd($answer);

            $parsedData = self::parseResponse($answer);

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

    public static function parseResponse($response)
    {
        $cleanData = trim($response);
        $cleanData = str_replace("'", "\"", $response);
        $cleanData = str_replace("\n", "", $cleanData);

        return $cleanData;
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

        $response = self::CallPythonAndFormatResponse($prompt);
        $formattedResponse = self::parseResponse($response);
        $responseSummary = "\n\nSummary for the time between dates: Total tasks created: {$tasksCreatedCount}. Total tasks finished: {$tasksFinishedCount}.";
        $formattedResponse .= $responseSummary;

        DB::table('summary_logs')->insert([
            'start_date' => $startDate,
            'end_date' => $endDate,
            'summary' => $formattedResponse,
            'tasks_created_count' => $tasksCreatedCount,
            'tasks_finished_count' => $tasksFinishedCount,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json(['response' => $formattedResponse]);
    }
}