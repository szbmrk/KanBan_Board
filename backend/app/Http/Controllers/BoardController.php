<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Board;
use App\Models\Column;
use App\Models\Task;
use Illuminate\Validation\Rule;

class BoardController extends Controller
{
    public function show($board_id)
    {
        $user = auth()->user();
        $board = Board::with('columns.tasks')->find($board_id);

        if (!$board) {
            return response()->json(['error' => 'Board not found'], 404);
        }

        if (!$user->isMemberOfBoard($board_id)) {
            return response()->json(['error' => 'You are not a member of this board'], 403);
        }
        else{

            return response()->json(['board' => $board]);
        }
       
    }
  
    public function columnStore(Request $request, $board_id)
    {
        $user = auth()->user();
        $board = Board::find($board_id);

        if (!$board) {
            return response()->json(['error' => 'Board not found'], 404);
        }

        if (!$user->isMemberOfBoard($board_id)) {
            return response()->json(['error' => 'You are not a member of this board'], 403);
        }

        $this->validate($request, [
            'position' => 'required|integer',
        ]);

        //check if there is already a column with the same position)
        if($column = $board->columns()->where('position', $request->input('position'))->first() != null){
            return response()->json(['error' => 'There is already a column with this position'], 403);
        }

        $column = new Column([
            'position' => $request->input('position'),
            'board_id' => $board->board_id,
        ]);

        $board->columns()->save($column);

        return response()->json(['message' => 'Column created successfully', 'column' => $column]);
    }
    
    public function columnUpdate(Request $request, $column_id)
    {
        $user = auth()->user();
        $column = Column::find($column_id);
    
        if (!$column) {
            return response()->json(['error' => 'Column not found'], 404);
        }
    
        if (!$user->isMemberOfBoard($column->board_id)) {
            return response()->json(['error' => 'You are not a member of this board'], 403);
        }
        else {
            $column->name = $request->name;
            $column->is_finished = $request->is_finished;
            $column->task_limit = $request->task_limit;
            $column->save();
    
            return response()->json(['column' => $column]);
        }
    }

    public function taskStore(Request $request, $board_id)
    {
        $user = auth()->user();
        $board = Board::find($board_id);
    
        if (!$board) {
            return response()->json(['error' => 'Board not found'], 404);
        }
    
        if (!$user->isMemberOfBoard($board_id)) {
            return response()->json(['error' => 'You are not a member of this board'], 403);
        }
    
        $this->validate($request, [
            'title' => 'required|string|max:100',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'column_id' => [
                'required',
                'integer',
                Rule::exists('columns', 'column_id')->where(function ($query) use ($board_id) {
                    $query->where('board_id', $board_id);
                }),
            ],
            'priority_id' => 'nullable|integer|exists:priorities,priority_id',
        ]);
    
        // Find the last task position in the column

            $lastTask = Task::where('column_id', $request->input('column_id'))
            ->orderBy('position', 'desc')
            ->first();
        
        $position = $lastTask['position'] + 1.00;

    
        $task = new Task([
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'due_date' => $request->input('due_date'),
            'column_id' => $request->input('column_id'),
            'project_id' => $board->project_id,
            'priority_id' => $request->input('priority_id'),
            'position' => $position, // Set the position to the next available position
        ]);
    
        $task->save();
    
        return response()->json(['message' => 'Task created successfully', 'task' => $task]);
    }
}
