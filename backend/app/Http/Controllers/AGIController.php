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


class AGIController extends Controller
{
    public function generateCode(Request $request, $boardId, $taskId)
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

    public function generatePriority(Request $request, $boardId, $taskId) 
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

    public function generatePrioritiesForColumn(Request $request, $boardId, $columnId) 
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
}
