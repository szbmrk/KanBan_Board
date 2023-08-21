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
            case Str::lower("chatgpt draft"):
                $response = ChatGPTController::GenerateTaskDraftChatGPT($request);
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

    public function GenerateTaskDocumentationPerTask(Request $request, $boardId, $taskId)
    {
        $user = auth()->user();

        $response;
        
        switch($request->header('ChosenAI')) {
            case Str::lower("llama"):
                $response = LlamaController::GenerateTaskDocumentationPerTask($boardId, $taskId);
                break;
            case Str::lower("bard"):
                $response = BardController::GenerateTaskDocumentationPerTask($boardId, $taskId);
                break;
            default:
                $response = ChatGPTController::GenerateTaskDocumentationPerTask($boardId, $taskId);
                break;
        }

        return $response;
    }

    public function GenerateTaskDocumentationPerBoard(Request $request, $boardId)
    {
        $user = auth()->user();

        $response;
        
        switch($request->header('ChosenAI')) {
            case Str::lower("llama"):
                $response = LlamaController::GenerateTaskDocumentationPerBoard($boardId);
                break;
            case Str::lower("bard"):
                $response = BardController::GenerateTaskDocumentationPerBoard($boardId);
                break;
            default:
                $response = ChatGPTController::GenerateTaskDocumentationPerBoard($boardId);
                break;
        }

        return $response;
    }

    public function GenerateTaskDocumentationPerColumn(Request $request, $boardId, $taskId)
    {
        $user = auth()->user();

        $response;
        
        switch($request->header('ChosenAI')) {
            case Str::lower("llama"):
                $response = LlamaController::GenerateTaskDocumentationPerColumn($boardId, $taskId);
                break;
            case Str::lower("bard"):
                $response = BardController::GenerateTaskDocumentationPerColumn($boardId, $taskId);
                break;
            default:
                $response = ChatGPTController::GenerateTaskDocumentationPerColumn($boardId, $taskId);
                break;
        }

        return $response;
    }

}
