<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\AgiBehavior;
use Illuminate\Http\Request;
use App\Models\CraftedPrompt;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;



class AgiBehaviorController extends Controller
{
    public function GetBehaviors($boardId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized.'], 401);
        }

        $board = Board::where('board_id', $boardId)->first();

        if (!$board) {
            return response()->json(['error' => 'Board not found.'], 404);
        }

        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        // Get all crafted prompts for this board
        $behaviors = AgiBehavior::where('board_id', $boardId)->get();

        // Initialize an empty array to store the agiBehaviors


        return response()->json($behaviors);
    }

    public function StoreBehavior(Request $request, $boardId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized.'], 401);
        }

        $board = Board::where('board_id', $boardId)->first();

        if (!$board) {
            return response()->json(['error' => 'Board not found.'], 404);
        }

        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'agi_behavior' => 'string'
        ]);

        if ($validator->fails()) {
            $errorMessages = [];

            if ($validator->errors()->hasAny(['agi_behavior'])) {
                $errorMessages[] = $validator->errors()->first('agi_behavior');
            }

            return response()->json(['error' => implode(', ', $errorMessages)], 422);
        }



        //find agi behaviorid by the act_as_a value
        $agiBehaviors = AgiBehavior::where('act_as_a', $request->input('agi_behavior'))->get();

        foreach ($agiBehaviors as $agiBehavior) {
            if ($agiBehavior->board_id == $boardId) {
                return response()->json(['error' => 'Behavior already exists on this board!'], 422);
            }
        }


        $agiBehavior = new AgiBehavior();
        $agiBehavior->act_as_a = $request->input('agi_behavior');
        $agiBehavior->board_id = $boardId;
        $agiBehavior->save();

        return response()->json(['message' => 'Behavior Stored successfully.'], 200);
    }

    public function UpdateBehavior(Request $request, $boardId, $behaviorId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized.'], 401);
        }

        $board = Board::where('board_id', $boardId)->first();

        if (!$board) {
            return response()->json(['error' => 'Board not found.'], 404);
        }

        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'agi_behavior' => 'string'
        ]);

        if ($validator->fails()) {
            $errorMessages = [];

            if ($validator->errors()->hasAny(['agi_behavior'])) {
                $errorMessages[] = $validator->errors()->first('agi_behavior');
            }

            return response()->json(['error' => implode(', ', $errorMessages)], 422);
        }

        if ($request->input('agi_behavior') == null) {
            return response()->json(['error' => 'Behavior is required!'], 422);
        }


        $agiBehavior = AgiBehavior::find($behaviorId);

        if ($agiBehavior == null) {
            return response()->json(['error' => 'Behavior does not exist!'], 422);
        }

        if ($agiBehavior->board_id != $boardId) {
            return response()->json(['error' => 'Behavior does not exist on this board!'], 422);
        }

        $agiBehaviors = AgiBehavior::where('act_as_a', $request->input('agi_behavior'))->get();


        if ($agiBehaviors) {
            foreach ($agiBehaviors as $agiBehavior) {
                if ($agiBehavior->board_id == $boardId) {
                    return response()->json(['error' => 'Behavior already exists on this board!'], 422);
                }

            }
        }

        $agiBehavior->act_as_a = $request->input('agi_behavior');

        $agiBehavior->save();



        return response()->json(['message' => 'Behavior Updated successfully.'], 200);
    }

    public function DestroyBehavior(Request $request, $boardId, $behaviorId)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized.'], 401);
        }

        $board = Board::where('board_id', $boardId)->first();

        if (!$board) {
            return response()->json(['error' => 'Board not found.'], 404);
        }

        if (!$user->isMemberOfBoard($board->board_id)) {
            return response()->json(['error' => 'You are not a member of the team that owns this board.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'agi_behavior' => 'string'
        ]);

        if ($validator->fails()) {
            $errorMessages = [];

            if ($validator->errors()->hasAny(['agi_behavior'])) {
                $errorMessages[] = $validator->errors()->first('agi_behavior');
            }

            return response()->json(['error' => implode(', ', $errorMessages)], 422);
        }

        $agiBehavior = AgiBehavior::find($behaviorId);

        if ($agiBehavior == null) {
            return response()->json(['error' => 'Behavior does not exist!'], 422);
        }

        if ($agiBehavior->board_id != $boardId) {
            return response()->json(['error' => 'Behavior does not exist on this board!'], 422);
        }

        $agiBehavior->delete();

        return response()->json(['message' => 'Behavior Deleted successfully.'], 200);
    }
}
