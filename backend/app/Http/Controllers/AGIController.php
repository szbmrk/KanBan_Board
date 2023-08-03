<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AGIController extends Controller
{
    public function generateSubtasks(Request $request)
    {
        $task = "Create a kanban board";
        $column = "To Do";

        // Replace 'YOUR_API_KEY' with your actual ChatGPT API key or token
        $apiKey = env('OPENAI_API_KEY');

        // Prepare the prompt to be sent to the Python script
        $prompt = "Generate kanban tickets for {$task}. Write estimations to the tickets as well and add a tag to each ticket. The tickets should be in the column '{$column}'. Write a description to each of them as well";

        // Construct the Python command with the required arguments and path to the script
        
        $pythonScriptPath = env('PYTHON_SCRIPT_PATH');
        $command = "python {$pythonScriptPath}";

        try {
            // Execute the Python script and capture the output
            $subtask = shell_exec("{$command} 2>&1"); // Redirect stderr to stdout to capture any potential errors
            // Parse the response from the Python script

            // Return the subtask as a JSON response to the frontend
            return response()->json(['subtask' => $subtask]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()]);
        }
    }
}
