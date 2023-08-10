<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use App\Models\Task;
use App\Models\Column;
use App\Models\TaskTag;
use Illuminate\Http\Request;
use App\Helpers\ExecutePythonScript;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;


class AGIController extends Controller
{
    public function generateCode(Request $request, $boardId, $taskId)
    {
        $user = auth()->user();
        //find the task for the task id
        $task = Task::find($taskId);
        $taskTag = TaskTag::where('task_id', $task->task_id)->get();
        //find all the tags for the task
        $tags = Tag::whereIn('tag_id', $taskTag->pluck('tag_id'))->get();
        $tagNames = $tags->pluck('name');

        $response = ExecutePythonScript::instance()->GenerateCode($task->title, $task->description, $tagNames );
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

        $task = Task::find($taskId);
        $taskTag = TaskTag::where('task_id', $task->task_id)->get();
        //find all the tags for the task
        $tags = Tag::whereIn('tag_id', $taskTag->pluck('tag_id'))->get();
        $tagNames = $tags->pluck('name');

        $column = Column::find($task->column_id)->tasks()->get();
        

        $response = ExecutePythonScript::instance()->GeneratePriority($task->title, $task->description, $tagNames, $column );

        $cleanData = trim($response);
        
        return response()->json([
            'priority' => $cleanData,
        ]);
    }

    public function generatePrioritiesForColumn(Request $request, $boardId, $columnId) 
    {
        $user = auth()->user();


        $column = Column::find($columnId)->tasks()->get();  

        $response = ExecutePythonScript::instance()->generatePrioritiesForColumn($column );

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
