<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Board;
use App\Models\User;
use App\Models\FavouriteBoard;

class FavouriteBoardsController extends Controller
{
    public function index(int $user_id)
    {
        $user = User::find($user_id);
        if (!$user)
        {
            return response()->json(['error' => 'User not found'], 404);
        }

        $favourites = $user->favouriteBoards()->get();

        if ($favourites->isEmpty())
        {
            return response()->json(
                ['message' => 'No favourite boards found for this user'],
                200
            );
        }

        return response()->json(['favourites' => $favourites]);
    }

    public function store(Request $req)
    {
        $user = auth()->user();

        if (!$user)
        {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $board_id = $req->input('board_id');
        if (!$board_id)
        {
            return response()->json(['error' => 'Missing board_id field'], 422);
        }

        $board = Board::find($board_id);
        if (!$board)
        {
            return response()->json(['error' => 'Board not found...'], 404);
        }

        $team = $board->team;
        if (!$team->teamMembers->contains('user_id', $user->user_id)) {
            return response()->json(
                [
                    'error' => 'You are not a member of the team that owns this board'
                ],
                403
            );
        }

        $existingFavouriteBoard = FavouriteBoard::where('user_id', $user->user_id)
            ->where('board_id', $board_id)
            ->first();
        if ($existingFavouriteBoard)
        {
            return response()->json(
                ['error' => 'Task is already in your favorite tasks'],
                409
            );
        }

        $favouriteBoard = new FavouriteBoard();
        $favouriteBoard->user_id = $user->user_id;
        $favouriteBoard->board_id = $board_id;
        $favouriteBoard->save();

        return response()->json(
            ['message' => 'Board added to favorite boards successfully.'],
            201
        );
    }
}
