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
                if($request->header('Draft') == true)
                {
                    $response = BardController::generateTaskDraftBard($request);
                    break;
                }
                $response = BardController::generateTaskBard($request);
                break;
            default:
                if($request->header('Draft') == true)
                {
                    $response = ChatGPTController::GenerateTaskDraftChatGPT($request);
                    break;
                }
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

    public function GenerateTaskCraftedPrompt(Request $request)
    {
        $user = auth()->user();
    
        $chosenAI = Str::lower($request->header('ChosenAI'));
        $response;
    
        switch ($chosenAI) {
            case "llama":
                $response = LlamaController::generateTaskLlama($request);
                break;
            case "chatgpt draft":
                $response = ChatGPTController::GenerateTaskDraftChatGPT($request);
                break;
            default:
                $response = ChatGPTController::GenerateCraftedTaskChatGPT($request);
                break;
        }
    
        return $response;
    }

    public function GenerateAttachmentLink(Request $request)
    {
        $user = auth()->user();

        $response;
        
        switch($request->header('ChosenAI')) {
            case Str::lower("llama"):
                $response = LlamaController::GenerateAttachmentLinkLlama($request);
                break;
            default:
                $response = ChatGPTController::GenerateAttachmentLinkChatGPT($request);
                break;
        }

        return $response;
    }
}
