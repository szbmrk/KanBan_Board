<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\TeamMember;
use Illuminate\Http\Request;

class TeamManagementController extends Controller
{
    public function show($id)
    {
        // Retrieve the team with the given ID from the database along with its team members and associated users' names
        $team = Team::with(['teamMembers.user'])->findOrFail($id);

        // Return the team and team members data to the frontend
        return response()->json([
            'team' => $team,
        ]);
    }
}
