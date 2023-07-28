<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Team;
use App\Models\Board;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $teams = Team::where('created_by', $user->user_id)->with('boards')->get();

        return response()->json(['teams' => $teams]);
    }
}
