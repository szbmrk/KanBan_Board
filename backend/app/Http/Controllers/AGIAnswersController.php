<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Board;
use App\Models\AGIAnswers;
use App\Models\Task;
use App\Models\Column;


class AGIAnswersController extends Controller
{
    public function index($boardId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized.'], 401);
        }

        $board = Board::find($boardId);

        if (!$board) {
            return response()->json(['error' => 'Board not found.'], 404);
        }

        if (!$board->team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $answers = $board->AGIAnswers;

        if(!$answers) {
            return response()->json(['error' => 'No answers found.'], 404);
        }

        return response()->json(['answers' => $answers], 200);
    }

    public function storePerTask(Request $request, $boardId, $taskId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized.'], 401);
        }

        $board = Board::find($boardId);

        if (!$board) {
            return response()->json(['error' => 'Board not found.'], 404);
        }

        if (!$board->team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $task = Task::find($taskId);

        if (!$task) {
            return response()->json(['error' => 'Task not found.'], 404);
        }

        if ($task->board_id !== $board->board_id) {
            return response()->json(['error' => 'Task does not belong to the specified board.'], 400);
        }

        $answer = new AGIAnswers([
            'answer' => $request->input('answer'),
            'board_id' => $board->board_id,
            'task_id' => $task->task_id,
        ]);

        $answer->save();

        return response()->json(['message' => 'Answer added successfully.'], 201);
    }

    public function storePerColumn(Request $request, $boardId,$columnId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized.'], 401);
        }

        $board = Board::find($boardId);

        if (!$board) {
            return response()->json(['error' => 'Board not found.'], 404);
        }

        if (!$board->team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $column = Column::find($columnId);

        if (!$column) {
            return response()->json(['error' => 'Task not found.'], 404);
        }

        $answer = new AGIAnswers([
            'answer' => $request->input('answer'),
            'board_id' => $board->board_id,
            'column_id' => $column->column_id,
        ]);

        $answer->save();

        return response()->json(['message' => 'Answer added successfully.'], 201);
    }

    public function storePerBoard(Request $request, $boardId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized.'], 401);
        }

        $board = Board::find($boardId);

        if (!$board) {
            return response()->json(['error' => 'Board not found.'], 404);
        }

        if (!$board->team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $answer = new AGIAnswers([
            'answer' => $request->input('answer'),
            'board_id' => $board->board_id,
        ]);

        $answer->save();

        return response()->json(['message' => 'Answer added successfully.'], 201);
    }

    public function update(Request $request, $boardId, $taskId, $answerId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized.'], 401);
        }

        $board = Board::find($boardId);

        if (!$board) {
            return response()->json(['error' => 'Board not found.'], 404);
        }

        if (!$board->team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $task = Task::find($taskId);

        if (!$task) {
            return response()->json(['error' => 'Task not found.'], 404);
        }

        if ($task->board_id !== $board->board_id) {
            return response()->json(['error' => 'Task does not belong to the specified board.'], 400);
        }

        $answer = AGIAnswers::where('agi_answer_id', $answerId)
            ->where('board_id', $board->board_id)
            ->where('task_id', $task->task_id)
            ->first();

        if (!$answer) {
            return response()->json(['error' => 'Answer not found for the specified board and task.'], 404);
        }

        $answer->fill([
            'answer' => $request->input('answer', $answer->answer), // Csak a beérkező adat vagy a meglévő adat marad
        ]);

        $answer->save();

        return response()->json(['message' => 'Answer updated successfully.'], 200);
    }

    public function destroy($boardId, $answerId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized.'], 401);
        }

        $board = Board::find($boardId);

        if (!$board) {
            return response()->json(['error' => 'Board not found.'], 404);
        }

        if (!$board->team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $answer = AGIAnswers::find($answerId);

        if (!$answer) {
            return response()->json(['error' => 'Answer not found.'], 404);
        }

        $answer = AGIAnswers::where('agi_answer_id', $answerId)
            ->where('board_id', $board->board_id)
            ->where('task_id', $answer->answer_id)
            ->first();

        if (!$answer) {
            return response()->json(['error' => 'Answer not found for the specified board and task.'], 404);
        }

        $answer->delete();

        return response()->json(['message' => 'Answer deleted successfully.'], 200);
    }

    

}
