<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Board;
use App\Models\AGIAnswers;
use App\Models\Task;
use App\Models\Column;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use App\Events\BoardChange;
use Illuminate\Support\Facades\Event;


class AGIAnswersController extends Controller
{
    public function indexTaskDocumentation($boardId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized.'], 401);
        }

        $board = Board::find($boardId);

        if (!$board) {
            return response()->json(['error' => 'Board not found.'], 404);
        }

        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $answers = $board->AGIAnswers->filter(function ($answer) {
            return $answer->codeReviewOrDocumentationType === null && $answer->codeReviewOrDocumentation === null;
        })->map(function ($answer) {
            return $answer->only(['chosenAI', 'taskDocumentation', 'taskDocumentationText', 'task_id', 'board_id', 'column_id', 'user_id', 'created_at', 'updated_at']);
        })->values();

        if ($answers->isEmpty()) {
            return response()->json(['error' => 'No answers found.'], 404);
        }

        return response()->json($answers, 200);
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

        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $task = Task::find($taskId);

        if (!$task) {
            return response()->json(['error' => 'Task not found.'], 404);
        }

        if ($task->board_id !== $board->board_id) {
            return response()->json(['error' => 'Task does not belong to the specified board.'], 400);
        }
        try {
            $this->validate($request, [
                'taskDocumentation' => 'string',
            ]);
        } catch (ValidationException) {
            return response()->json(['error' => 'Invalid task documentation'], 400);
        }

        $answer = new AGIAnswers([
            'chosenAI' => $request->header('ChosenAI'),
            'taskDocumentation' => $request->input('taskDocumentation'),
            'taskDocumentationText' => $request->input('taskDocumentationText'),
            'board_id' => $board->board_id,
            'task_id' => $task->task_id,
            'user_id' => $user->user_id,
        ]);

        $answer->save();

        return response()->json(['message' => 'Answer added successfully.'], 201);
    }

    public function storePerColumn(Request $request, $boardId, $columnId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized.'], 401);
        }

        $board = Board::find($boardId);

        if (!$board) {
            return response()->json(['error' => 'Board not found.'], 404);
        }

        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $column = Column::find($columnId);

        if (!$column) {
            return response()->json(['error' => 'Task not found.'], 404);
        }

        try {
            $this->validate($request, [
                'taskDocumentation' => 'string',
            ]);
        } catch (ValidationException) {
            return response()->json(['error' => 'Invalid task documentation'], 400);
        }

        $answer = new AGIAnswers([
            'chosenAI' => $request->header('ChosenAI'),
            'taskDocumentation' => $request->input('taskDocumentation'),
            'taskDocumentationText' => $request->input('taskDocumentationText'),
            'board_id' => $board->board_id,
            'column_id' => $column->column_id,
            'user_id' => $user->user_id,
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

        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        try {
            $this->validate($request, [
                'taskDocumentation' => 'string',
            ]);
        } catch (ValidationException) {
            return response()->json(['error' => 'Invalid task documentation'], 400);
        }

        $answer = new AGIAnswers([
            'chosenAI' => $request->header('ChosenAI'),
            'taskDocumentation' => $request->input('taskDocumentation'),
            'taskDocumentationText' => $request->input('taskDocumentationText'),
            'board_id' => $board->board_id,
            'user_id' => $user->user_id,
        ]);

        $answer->save();

        return response()->json(['message' => 'Answer added successfully.'], 201);
    }

    public function update(Request $request, $boardId, $answerId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized.'], 401);
        }

        $board = Board::find($boardId);

        if (!$board) {
            return response()->json(['error' => 'Board not found.'], 404);
        }

        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        try {
            $this->validate($request, [
                'taskDocumentation' => 'string',
            ]);
        } catch (ValidationException) {
            return response()->json(['error' => 'Invalid task documentation'], 400);
        }

        $answer = AGIAnswers::where('agi_answer_id', $answerId)
            ->where('board_id', $board->board_id)
            ->first();

        if (!$answer) {
            return response()->json(['error' => 'Answer not found for the specified board and task.'], 404);
        }

        $answer->fill([
            'taskDocumentation' => $request->input('taskDocumentation', $answer->taskDocumentation),
            'taskDocumentationText' => $request->input('taskDocumentationText', $answer->taskDocumentationText),
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

        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $answer = AGIAnswers::find($answerId);

        if (!$answer) {
            return response()->json(['error' => 'Answer not found.'], 404);
        }

        if ($answer->codeReviewOrDocumentationType !== null || $answer->codeReviewOrDocumentation !== null) {
            return response()->json(['error' => 'Cannot delete this answer.'], 400);
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

    public function indexCodeReviewOrDocumentation($boardId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized.'], 401);
        }

        $board = Board::find($boardId);

        if (!$board) {
            return response()->json(['error' => 'Board not found.'], 404);
        }

        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $answers = $board->AGIAnswers->filter(function ($answer) {
            return $answer->codeReviewOrDocumentationType !== null && $answer->codeReviewOrDocumentation !== null;
        })->map(function ($answer) {
            return $answer->only(['chosenAI', 'agi_answer_id', 'codeReviewOrDocumentationType', 'codeReviewOrDocumentation', 'codeReviewOrDocumentationText', 'board_id', 'user_id', 'created_at', 'updated_at']);
        })->values();

        return response()->json($answers, 200);
    }

    public function storeCodeReviewOrDocumentation(Request $request, $boardId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized.'], 401);
        }

        $board = Board::find($boardId);

        if (!$board) {
            return response()->json(['error' => 'Board not found.'], 404);
        }

        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        try {
            $this->validate($request, [
                'codeReviewOrDocumentationType' => 'required|in:DOCUMENTATION,CODE REVIEW',
                'codeReviewOrDocumentation' => 'required|string',
            ]);

        } catch (ValidationException) {
            return response()->json(['error' => 'Invalid code review or documentation type Or code review or documentation'], 400);
        }

        $data = $request->only(['codeReviewOrDocumentationType', 'codeReviewOrDocumentation']);

        $answer = new AGIAnswers([
            'chosenAI' => $request->header('ChosenAI'),
            'codeReviewOrDocumentationType' => $data['codeReviewOrDocumentationType'],
            'codeReviewOrDocumentation' => $data['codeReviewOrDocumentation'],
            'board_id' => $board->board_id,
            'user_id' => $user->user_id,
        ]);

        $answer->save();

        return response()->json(['message' => 'Answer created successfully'], 201);
    }

    public function updateCodeReviewOrDocumentation(Request $request, $boardId, $answerId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized.'], 401);
        }

        $board = Board::find($boardId);

        if (!$board) {
            return response()->json(['error' => 'Board not found.'], 404);
        }

        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        try {
            $this->validate($request, [
                'codeReviewOrDocumentationType' => 'in:DOCUMENTATION,CODE REVIEW',
                'codeReviewOrDocumentation' => 'string',
                'codeReviewOrDocumentationText' => 'string',
            ]);
        } catch (ValidationException) {
            return response()->json(['error' => 'Invalid code review or documentation type or code review or documentation'], 400);
        }

        $data = $request->only(['codeReviewOrDocumentationType', 'codeReviewOrDocumentation', 'codeReviewOrDocumentationText']);

        $answer = AGIAnswers::find($answerId);

        if (!$answer) {
            return response()->json(['error' => 'Answer not found.'], 404);
        }

        foreach ($data as $key => $value) {
            if (!is_null($value)) {
                $answer->$key = $value;
            }
        }

        $answer->save();

        return response()->json(['message' => 'Answer updated successfully'], 200);
    }

    public function destroyCodeReviewOrDocumentation($boardId, $answerId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized.'], 401);
        }

        $board = Board::find($boardId);

        if (!$board) {
            return response()->json(['error' => 'Board not found.'], 404);
        }

        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $answer = AGIAnswers::find($answerId);

        if (!$answer) {
            return response()->json(['error' => 'Answer not found.'], 404);
        }
        if ($answer->taskDocumentation !== null) {
            return response()->json(['error' => 'Cannot delete this answer.'], 400);
        }
        $answer->delete();

        $data = [
            'codeReviewOrDocumentation' => $answer
        ];
        broadcast(new BoardChange($boardId, "DELETED_CODE_REVIEW_OR_DOCUMENTATION", $data));

        return response()->json(['message' => 'Answer deleted successfully'], 200);
    }

}
