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
use Illuminate\Support\Facades\Log;


class AGIController extends Controller
{
    public static function GenerateTask(Request $request)
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
    

    public static function GenerateSubtask(Request $request)
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

    public static function GenerateTaskCraftedPrompt(Request $request)
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
                $response = ChatGPTController::GenerateTaskChatGPT($request);
                break;
        }
    
        return $response;
    }

    public static function GenerateAttachmentLink(Request $request)
    {
        $user = auth()->user();

        $response;
        
        switch($request->header('ChosenAI')) {
            case Str::lower("llama"):
                $response = LlamaController::GenerateAttachmentLinkLlama($request);
                break;
            case Str::lower("bard"):
                $response = BardController::GenerateAttachmentLinkBard($request);
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

    public function GenerateCodeReviewOrDocumentation(Request $request, $boardId)
    {
        //without json stringify it will not work!!!
        $user = auth()->user();

        $response;
        $chosenType = $request->header('ChosenType');
        
        switch($request->header('ChosenAI')) {
            case Str::lower("llama"):
                $response = LlamaController::GenerateCodeReviewOrDocumentation($request,$boardId,$chosenType);
                break;
            case Str::lower("bard"):
                $response = BardController::GenerateCodeReviewOrDocumentation($request,$boardId,$chosenType);
                break;
            case Str::lower("chatgpt"):
                $response = ChatGPTController::GenerateCodeReviewOrDocumentation($request,$boardId,$chosenType);
                break;
            default:
                $response = "No AI chosen";
                break;
        }
        return $response;
    }


}