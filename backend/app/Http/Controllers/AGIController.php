<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AGIController extends Controller
{
    // Your other controller methods can go here

    public function generateSubtasks(Request $request)
    {
        // Replace 'YOUR_API_KEY' with your actual ChatGPT API key or token
        $apiKey = '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';

        $task = "React backend development - login page";
        $column = "In progress";

        // Extract the prompt from the JSON payload
        $prompt = "Generate kanban tickets for {$task}. Write estimations to the tickets as well and add a tagg to each ticket. The tickets should be in the column '{$column}'.Write a descreption to each of them as well";

        $maxTokens = 100; // Adjust this value based on your requirement

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer $apiKey",
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/engines/text-davinci-003/completions', [
                'prompt' => $prompt,
                'max_tokens' => $maxTokens,
            ]);

            $responseData = $response->json();

            if (isset($responseData['choices']) && !empty($responseData['choices'])) {
                // Handle the response here (e.g., extract the generated subtask from the response).
                $subtask = $responseData['choices'][0]['text'];

                // Return the subtask as a JSON response to the frontend
                return response()->json(['subtask' => $subtask]);
            } else {
                return response()->json(['error' => 'Invalid response from OpenAI API']);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()]);
        }
    }
}
