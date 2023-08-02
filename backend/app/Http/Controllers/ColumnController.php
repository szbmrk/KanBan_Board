<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Board;
use App\Models\Column;
use App\Models\Task;
use App\Models\Attachment;
use App\Models\Comment;
use App\Models\Mention;
use App\Models\FavouriteTask;
use App\Models\Log; 
use App\Models\TaskTag;
use App\Models\UserTask;
use App\Models\Feedback;
use Illuminate\Validation\Rule;
use App\Helpers\LogRequest;


class ColumnController extends Controller
{
    public function columnStore(Request $request, $board_id)
    {
        $user = auth()->user();
        $board = Board::find($board_id);
    
        if (!$board) {
            LogRequest::instance()->logAction('BOARD NOT FOUND', $user->user_id, "Board not found. -> board_id: $board_id", null, null, null);
            return response()->json(['error' => 'Board not found'], 404);
        }
    
        if (!$user->isMemberOfBoard($board_id)) {
            return response()->json(['error' => 'You are not a member of this board'], 403);
        }
    
        $this->validate($request, [
            'name' => 'required|string|max:50',
        ]);
    
        $maxPosition = $board->columns()->max('position');
    
        $column = new Column([
            'name' => $request->input('name'),
            'position' => $maxPosition !== null ? $maxPosition + 1 : 0,
            'board_id' => $board->board_id,
            'is_finished' => $request->input('is_finished', false),
            'task_limit' => $request->input('task_limit', null),
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
  
    public function columnPositionUpdate(Request $request, $board_id)
    {
        $user = auth()->user();
        $board = Board::find($board_id);
    
        if (!$board) {
            return response()->json(['error' => 'Board not found'], 404);
        }
    
        if (!$user->isMemberOfBoard($board_id)) {
            return response()->json(['error' => 'You are not a member of this board'], 403);
        }
    
        $columns = $request->columns;
    
        if (count($columns) !== count(array_unique($columns))) {
            return response()->json(['error' => 'Duplicate positions are not allowed'], 400);
        }
    
        foreach ($columns as $position => $column_id) {
            $column = Column::find($column_id);
            if ($column && $column->board_id == $board_id) {
                $column->position = $position;
                $column->save();
            } else {
                return response()->json(['error' => 'Column not found or not belong to this board'], 404);
            }
        }
    
        return response()->json(['message' => 'Columns position updated successfully.']);
    }

    public function columnDestroy($board_id, $column_id)
    {
        $user = auth()->user();
        $board = Board::find($board_id);

        if (!$board) {
            return response()->json(['error' => 'Board not found'], 404);
        }

        if (!$user->isMemberOfBoard($board_id)) {
            return response()->json(['error' => 'You are not a member of this board'], 403);
        }

        $column = Column::where('board_id', $board_id)->find($column_id);

        if (!$column) {
            return response()->json(['error' => 'Column not found'], 404);
        }

        foreach ($column->tasks as $task) {

            $task->attachments()->delete();

            Mention::whereIn('comment_id', $task->comments->pluck('comment_id'))->delete();
            
            Comment::whereIn('comment_id', $task->comments->pluck('comment_id'))->delete();
    
            FavouriteTask::where('task_id', $task->task_id)->delete();

            Log::where('task_id', $task->task_id)->delete();

            TaskTag::where('task_id', $task->task_id)->delete();

            UserTask::where('task_id', $task->task_id)->delete();

            Feedback::where('task_id', $task->task_id)->delete();

            $task->delete();
        }

        $column->delete();

        return response()->json(['message' => 'Column deleted successfully']);
    }
  
}
