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
        $prompt = "As an AI assistant, generate short and understandable subtasks for the task: '{$task}' Please always divide your answer into like this: Title: {content1} Description: {content1} Due Date: '{$formattedDate}' assign a due date relative to the current date in this format: 'yyyy-mm-dd' Tags: {tag1, tag2, tag3} Please include at least one value for each field mainly for tags. Focus on the tasks and do not write a summary at the end";
        
        $pythonScriptPath = env('LLAMA_PYTHON_SCRIPT_PATH');
        $apiToken = env('REPLICATE_API_TOKEN');
        $command = "set REPLICATE_API_TOKEN={$apiToken} && python {$pythonScriptPath} \"{$prompt}\"";
        
        try {
            $subtaskResponse = shell_exec("{$command} 2>&1");
            
            // Process API response
            $subtaskResponse = str_replace("\n", '', $subtaskResponse);
            $subtasksArray = explode('Title:', $subtaskResponse);
            unset($subtasksArray[0]);
            
            $subtasks = [];
            
            foreach ($subtasksArray as $subtask) {
                $subtask = trim($subtask);
        
                list($title, $descriptionAndRest) = explode('Description:', $subtask, 2);
                $title = trim($title);
        
                list($description, $dueDateAndRest) = explode('Due Date:', $descriptionAndRest, 2);
                $description = trim($description);
        
                if (strpos($dueDateAndRest, 'Tags:') !== false) {
                    list($dueDate, $tagsAndRest) = explode('Tags:', $dueDateAndRest, 2);
                    $dueDate = trim($dueDate);
                    $dueDateFormatted = date("Y-m-d", strtotime($dueDate));
                    $tags = explode(',', $tagsAndRest);
                    $tags = array_map('trim', $tags);
                } else {
                    $dueDate = trim($dueDateAndRest);
                    $tags = [];
                }
        
                $subtasks[] = [
                    'title' => $title,
                    'description' => $description,
                    'due_date' => $dueDateFormatted,
                    'tags' => $tags,
                ];
            }
        
            $jsonSubtaskResponse = json_encode($subtasks, JSON_PRETTY_PRINT);
        
            echo $jsonSubtaskResponse;
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()]);
        }
    }

    public function testSubtaskParsing()
    {

        $currentTime = time();
        $formattedDate = date("Y-m-d", $currentTime);

        $response = "\n Of\n course\n!\n I\n'\nm\n here\n to\n assist\n you\n with\n creating\n a\n login\n page\n on\n the\n backend\n.\n Here\n are\n three\n sub\ntasks\n related\n to\n this\n task\n:\n\n\nTitle\n:\n Design\n a\n User\n Interface\n for\n the\n Login\n Page\n\n\nDescription\n:\n Create\n a\n vis\nually\n appe\naling\n and\n user\n-\nfriend\nly\n interface\n for\n the\n login\n page\n,\n including\n inputs\n for\n username\n and\n password\n,\n a\n submit\n button\n,\n and\n any\n additional\n fields\n as\n needed\n (\ne\n.\ng\n.,\n remember\n me\n,\n forgot\n password\n).\n Ens\nure\n that\n the\n design\n is\n consistent\n with\n the\n overall\n brand\ning\n of\n the\n application\n and\n follows\n basic\n security\n best\n practices\n.\n\n\nD\nue\n Date\n:\n August\n \n9\n,\n \n2\n0\n2\n3\n\n\nTags\n:\n #\nUI\nDes\nign\n #\nUser\nEx\nper\nience\n #\nSecurity\n\n\n\n\nTitle\n:\n Im\nplement\n Authentication\n Mechan\nism\n\n\n\n\nDescription\n:\n Research\n and\n implement\n an\n appropriate\n authentication\n mechanism\n for\n the\n login\n page\n,\n such\n as\n form\n-\nbased\n authentication\n or\n O\nAuth\n.\n Consider\n factors\n such\n as\n user\n input\n validation\n,\n error\n handling\n,\n and\n session\n management\n.\n Make\n sure\n the\n implementation\n is\n secure\n and\n scal\nable\n.\n\n\nD\nue\n Date\n:\n August\n \n1\n6\n,\n \n2\n0\n2\n3\n\n\n\n\nTags\n:\n #\nAuthentication\n #\nAuthorization\n #\nSecurity\n\n\n\n\nTitle\n:\n Test\n and\n Debug\n the\n Login\n Function\nality\n\n\n\n\nDescription\n:\n Test\n the\n login\n functionality\n on\n various\n browsers\n and\n devices\n to\n ensure\n it\n works\n correctly\n.\n Use\n debugging\n tools\n to\n identify\n and\n fix\n any\n issues\n or\n errors\n in\n the\n code\n.\n Perform\n security\n testing\n to\n verify\n that\n the\n implemented\n authentication\n mechanism\n is\n secure\n and\n cannot\n be\n easily\n explo\nited\n by\n attack\ners\n.\n\n\nD\nue\n Date\n:\n August\n \n2\n3\n,\n \n2\n0\n2\n3\n\n\n\n\nI\n hope\n these\n sub\ntasks\n help\n you\n in\n your\n task\n!\n Let\n me\n know\n if\n you\n have\n any\n questions\n or\n need\n further\n clar\nification\n.\n";

        $response = str_replace("\n", '', $response);
        
        $tasksArray = explode('Title:', $response);
        
        unset($tasksArray[0]);
        
        $tasks = [];

        foreach ($tasksArray as $task) {
            $task = trim($task);

            list($title, $descriptionAndRest) = explode('Description:', $task, 2);
            $title = trim($title);

            list($description, $dueDateAndRest) = explode('Due Date:', $descriptionAndRest, 2);
            $description = trim($description);

            if (strpos($dueDateAndRest, 'Tags:') !== false) {
                list($dueDate, $tagsAndRest) = explode('Tags:', $dueDateAndRest, 2);
                $dueDate = trim($dueDate);
                $dueDateFormatted = date("Y-m-d", strtotime($dueDate));
                $tags = explode(',', $tagsAndRest);
                $tags = array_map('trim', $tags);
            } else {
                $dueDate = trim($dueDateAndRest);
                $tags = [];
            }

            $tasks[] = [
                'title' => $title,
                'description' => $description,
                'due_date' => $dueDateFormatted,
                'tags' => $tags,
            ];
        }

        $jsonResponse = json_encode($tasks, JSON_PRETTY_PRINT);

        echo $jsonResponse;
    }

}