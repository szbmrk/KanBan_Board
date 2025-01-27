<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Log;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized.'], 404);
        }

        $teamCount = $user->teams->count();
        $boardCount = $user->boards->count();
        $logCount = Log::where('user_id', $user->user_id)->count();

        $favourites = $user->favouriteBoards()
            ->with('board')
            ->get()
            ->map(function ($favourite) {
                return [
                    'id' => $favourite->id,
                    'user_id' => $favourite->user_id,
                    'board_id' => $favourite->board->board_id,
                    'team_id' => $favourite->board->team_id,
                    'board_name' => $favourite->board->name,
                ];
            });

        return response()->json([
            'teamCount' => $teamCount,
            'boardCount' => $boardCount,
            'logCount' => $logCount,
            'favourites' => $favourites,
        ]);
    }
}
