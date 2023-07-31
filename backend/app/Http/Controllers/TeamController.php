<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Team;

class TeamController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $teams = Team::where('created_by', $user->user_id)->get();

        return response()->json(['teams' => $teams]);
    }
}
