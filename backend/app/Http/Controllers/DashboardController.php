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
    }
}
