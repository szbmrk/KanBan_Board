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

        $prompt = "As an AI assistant, generate short and understandable subtasks for the task: '{$task}' Please always split your answer into 'title' and 'description' and 'due_date' and 'tags' and roughly estimate how much time is needed for the given bag in terms of the current date '{$currentTime}', and assign tags if needed, for example like this: Title: {content1} Description: {content1} Due_date: {content1} Tags: {content1}";

        $pythonScriptPath = env('LLAMA_PYTHON_SCRIPT_PATH');
        $apiToken = env('REPLICATE_API_TOKEN');
        $command = "set REPLICATE_API_TOKEN={$apiToken} && python {$pythonScriptPath} \"{$prompt}\"";

        try {
            $subtask = shell_exec("{$command} 2>&1");
    
            $lines = explode("\n", $subtask);
    
            $tasks = [];
            $currentTask = null;
    
            foreach ($lines as $line) {
                $line = trim($line);
    
                if (strpos($line, 'Title:') === 0) {
                    if ($currentTask) {
                        $tasks[] = $currentTask;
                    }
                    $currentTask = [
                        'title' => trim(substr($line, strlen('Title:'))),
                        'tags' => [],
                    ];
                } elseif (strpos($line, 'Description:') === 0) {
                    $currentTask['description'] = trim(substr($line, strlen('Description:')));
                } elseif (strpos($line, 'Due_date:') === 0) {
                    $currentTask['due_date'] = trim(substr($line, strlen('Due_date:')));
                } elseif (strpos($line, 'Tags:') === 0) {
                    $tags = explode(',', substr($line, strlen('Tags:')));
                    $currentTask['tags'] = array_map('trim', $tags);
                }
            }
    
            if ($currentTask) {
                $tasks[] = $currentTask;
            }
    
            // Convert due_date strings to actual date objects if needed
            foreach ($tasks as &$task) {
                if (isset($task['due_date'])) {
                    $task['due_date'] = date('Y-m-d', strtotime($task['due_date']));
                }
            }
    
            return response()->json(['tasks' => $tasks]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()]);
        }
    }

    public function testSubtaskParsing()
    {
        $sampleResponse = "\n Sure\n!\n Here\n are\n some\n short\n and\n understand\nable\n sub\ntasks\n for\n the\n task\n \"\nRole\nController\n validation\n\":\n\n\nTitle\n:\n Valid\nate\n Ro\nle\nController\n schema\n for\n consist\nency\n\n\nDescription\n:\n Ver\nify\n that\n the\n Ro\nle\nController\n schema\n ad\nher\nes\n to\n established\n standards\n and\n best\n practices\n for\n data\n model\ning\n,\n including\n CR\nUD\n (\nCreate\n,\n Read\n,\n Update\n,\n Delete\n)\n operations\n and\n security\n consider\nations\n.\n Ens\nure\n that\n all\n required\n fields\n are\n present\n and\n correctly\n formatted\n,\n and\n that\n relationships\n between\n tables\n are\n properly\n defined\n.\n\n\nD\nue\n Date\n:\n \n2\n days\n from\n now\n (\nass\numing\n the\n current\n date\n is\n March\n \n7\n,\n \n1\n6\n9\n1\n5\n8\n6\n9\n3\n6\n)\n\n\nTags\n:\n data\n-\nmodel\ning\n,\n schema\n-\nvalidation\n,\n cr\nud\n-\noper\nations\n,\n security\n-\ncons\nider\nations\n\n\nEst\nim\nated\n Time\n Ne\neded\n:\n \n4\n hours\n\n\n\n\nTitle\n:\n Aud\nit\n Ro\nle\nController\n logic\n for\n potential\n vulner\nabilities\n\n\n\n\nDescription\n:\n Ex\nam\nine\n the\n existing\n Ro\nle\nController\n code\nbase\n to\n identify\n any\n potential\n security\n vulner\nabilities\n or\n weak\nness\nes\n in\n the\n implemented\n logic\n.\n Investig\nate\n possible\n attack\n vectors\n and\n suggest\n mit\nig\nation\n strateg\nies\n to\n address\n them\n.\n This\n includes\n review\ning\n permissions\n,\n access\n control\n lists\n,\n and\n authentication\n flows\n to\n ensure\n they\n meet\n industry\n standards\n and\n company\n policies\n.\n\n\nD\nue\n Date\n:\n \n3\n days\n from\n now\n (\nass\numing\n the\n current\n date\n is\n March\n \n1\n0\n,\n \n1\n6\n9\n1\n5\n8\n6\n9\n3\n6\n)\n\n\n\n\nTags\n:\n security\n-\naud\niting\n,\n vulner\nability\n-\nass\ness\nment\n,\n access\n-\ncontrol\n,\n authentication\n-\nflow\ns\n\n\nEst\nim\nated\n Time\n Ne\neded\n:\n \n6\n hours\n\n\n\n\nTitle\n:\n Integr\nate\n Ro\nle\nController\n with\n relevant\n services\n for\n se\nam\nless\n user\n management\n\n\n\n\nDescription\n:\n Set\n up\n and\n configure\n necessary\n integr\nations\n between\n Ro\nle\nController\n and\n other\n services\n such\n as\n Active\n Directory\n,\n L\nD\nAP\n,\n or\n identity\n prov\niders\n for\n user\n authentication\n and\n authorization\n.\n Ens\nure\n that\n users\n can\n be\n created\n,\n updated\n,\n and\n deleted\n through\n the\n Ro\nle\nController\n interface\n,\n and\n that\n their\n roles\n are\n correctly\n assigned\n based\n on\n those\n service\n'\ns\n provided\n information\n.\n\n\nD\nue\n Date\n:\n \n2\n weeks\n from\n now\n (\nass\numing\n the\n current\n date\n is\n March\n \n2\n4\n,\n \n1\n6\n9\n1\n5\n8\n6\n9\n3\n6\n)\n\n\n\n\nTags\n:\n integration\n-\ntesting\n,\n service\n-\nintegration\n,\n user\n-\nmanagement\n,\n auth\nent\nification\n-\nauthor\nization\n\n\nEst\nim\nated\n Time\n Ne\neded\n:\n \n8\n hours\n";

        $lines = explode("\n", $sampleResponse);

        $tasks = [];
        $currentTask = null;

        foreach ($lines as $line) {
            $line = trim($line);
            echo "Line: $line\n";

            if (strpos($line, 'Title:') === 0) {
                if ($currentTask) {
                    $tasks[] = $currentTask;
                }
                $currentTask = [
                    'title' => trim(substr($line, strlen('Title:'))),
                    'tags' => [],
                ];
            } elseif (strpos($line, 'Description:') === 0) {
                $currentTask['description'] = trim(substr($line, strlen('Description:')));
            } elseif (strpos($line, 'Due_date:') === 0) {
                $currentTask['due_date'] = trim(substr($line, strlen('Due_date:')));
            } elseif (strpos($line, 'Tags:') === 0) {
                $tagsLine = substr($line, strlen('Tags:'));
                $tags = explode(',', $tagsLine);
                $currentTask['tags'] = array_map('trim', $tags);
            }
        }

        if ($currentTask) {
            $tasks[] = $currentTask;
        }

        // Convert due_date strings to actual date objects if needed
        foreach ($tasks as &$task) {
            if (isset($task['due_date'])) {
                $task['due_date'] = date('Y-m-d', strtotime($task['due_date']));
            }
        }

        $formattedTasks = json_encode($tasks, JSON_PRETTY_PRINT);
        echo $formattedTasks;
    }
}