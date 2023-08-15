<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use App\Models\Task;
use App\Models\Column;
use App\Models\TaskTag;
use App\Models\Priority;
use Illuminate\Http\Request;
use App\Helpers\ExecutePythonScript;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\LlamaController;
use App\Http\Controllers\ChatGPTController;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;


class AGIController extends Controller
{
    public function GenerateTask(Request $request)
    {
        $user = auth()->user();

        $response;
        
        switch($request->header('ChosenAI')) {
            case Str::lower("llama"):
                $response = LlamaController::generateTaskLlama($request);
                break;
            case Str::lower("bard"):
                $response = BardController::generateTaskBard($request);
                break;
            default:
                $response = ChatGPTController::GenerateTaskChatGPT($request);
                break;
        }

        return $response;
    }

    public function GenerateSubtask(Request $request)
    {
        $user = auth()->user();

        $response;
        
        switch($request->header('ChosenAI')) {
            case Str::lower("llama"):
                $response = LlamaController::generateSubtaskLlama($request);
                break;
            case Str::lower("bard"):
                $response = BardController::generateSubtaskBard($request);
                break;
            default:
                $response = ChatGPTController::GenerateSubtaskChatGPT($request);
                break;
        }

        return $response;
    }
}
