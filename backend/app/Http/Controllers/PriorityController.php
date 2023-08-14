<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Priority;

class PriorityController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        if (!$user) { 
                return response()->json(['error' => 'Unauthorized'], 401); 
        } 
            
        $priorities = Priority::all();

        if ($priorities->isEmpty()) {
            return response()->json(['error' => 'No priorities found'], 404);
        }

        return response()->json([$priorities]);
    }
}
