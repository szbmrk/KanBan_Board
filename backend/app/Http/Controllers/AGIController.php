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
use App\Http\Controllers\BardController;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use App\Events\BoardChange;
use Illuminate\Support\Facades\Event;


class AGIController extends Controller
{
    public static function GenerateTask(Request $request)
    {
        $user = auth()->user();

        $response = null;

        switch ($request->header('ChosenAI')) {
            case Str::lower("llama"):
                $response = LlamaController::generateTaskLlama($request);
                break;
            case Str::lower("chatgpt"):
                if ($request->header('Draft') == true) {
                    $response = ChatGPTController::GenerateTaskDraftChatGPT($request);
                    break;
                }
                $craftedPrompt = null;
                $response = ChatGPTController::GenerateTaskChatGPT($request, $craftedPrompt);
                break;
            default:
                return response()->json([
                    'error' => 'ChosenAI is not valid',
                ], 400);
        }
        return $response;
    }


    public static function GenerateSubtask(Request $request)
    {
        $user = auth()->user();

        $response = null;

        switch ($request->header('ChosenAI')) {
            case Str::lower("llama"):
                $response = LlamaController::generateSubtaskLlama($request);
                break;
            case Str::lower("chatgpt"):
                $response = ChatGPTController::GenerateSubtaskChatGPT($request);
                break;
            default:
                return response()->json([
                    'error' => 'ChosenAI is not valid',
                ], 400);
        }

        return $response;
    }

    public static function GenerateTaskCraftedPrompt(Request $request)
    {
        $user = auth()->user();

        $chosenAI = Str::lower($request->header('ChosenAI'));
        $response = null;

        switch ($chosenAI) {
            case "llama":
                $response = LlamaController::generateTaskLlama($request);
                break;
            case "chatgpt draft":
                $response = ChatGPTController::GenerateTaskDraftChatGPT($request);
                break;
            case Str::lower("chatgpt"):
                $response = ChatGPTController::GenerateTaskChatGPT($request);
                break;
            default:
                return response()->json([
                    'error' => 'ChosenAI is not valid',
                ], 400);
        }

        return $response;
    }

    public static function GenerateAttachmentLink(Request $request)
    {
        $user = auth()->user();

        $response = null;

        switch ($request->header('ChosenAI')) {
            case Str::lower("llama"):
                $response = LlamaController::GenerateAttachmentLinkLlama($request);
                break;
            case Str::lower("chatgpt"):
                $response = ChatGPTController::GenerateAttachmentLinkNotCraftedChatGPT($request);
                break;
            default:
                return response()->json([
                    'error' => 'ChosenAI is not valid',
                ], 400);
        }

        return $response;
    }

    public function GenerateTaskDocumentationPerTask(Request $request, $boardId, $taskId)
    {
        $user = auth()->user();

        $response = null;

        switch ($request->header('ChosenAI')) {
            case Str::lower("llama"):
                $response = LlamaController::GenerateTaskDocumentationPerTask($boardId, $taskId);
                break;
            case Str::lower("chatgpt"):
                $response = ChatGPTController::GenerateTaskDocumentationPerTask($boardId, $taskId);
                break;
            default:
                return response()->json([
                    'error' => 'ChosenAI is not valid',
                ], 400);
        }

        return $response;
    }

    public function GenerateTaskDocumentationPerBoard(Request $request, $boardId)
    {
        $user = auth()->user();

        $response = null;

        switch ($request->header('ChosenAI')) {
            case Str::lower("llama"):
                $response = LlamaController::GenerateTaskDocumentationPerBoard($boardId);
                break;
            case Str::lower("chatgpt"):
                $response = ChatGPTController::GenerateTaskDocumentationPerBoard($boardId);
                break;
            default:
                return response()->json([
                    'error' => 'ChosenAI is not valid',
                ], 400);
        }

        return $response;
    }

    public function GenerateTaskDocumentationPerColumn(Request $request, $boardId, $taskId)
    {
        $user = auth()->user();

        $response = null;

        switch ($request->header('ChosenAI')) {
            case Str::lower("llama"):
                $response = LlamaController::GenerateTaskDocumentationPerColumn($boardId, $taskId);
                break;
            case Str::lower("chatgpt"):
                $response = ChatGPTController::GenerateTaskDocumentationPerColumn($boardId, $taskId);
                break;
            default:
                return response()->json([
                    'error' => 'ChosenAI is not valid',
                ], 400);
        }

        return $response;
    }

    public function GenerateCodeReviewOrDocumentation(Request $request, $boardId)
    {
        $user = auth()->user();

        $response = null;
        $chosenType = $request->header('ChosenType');

        return response()->json([
            'error' => 'Testing error',
        ], 400);

        switch ($request->header('ChosenAI')) {
            case Str::lower("llama"):
                $response = LlamaController::GenerateCodeReviewOrDocumentation($request, $boardId, $chosenType);
                break;
            case Str::lower("chatgpt"):
                $response = ChatGPTController::GenerateCodeReviewOrDocumentation($request, $boardId, $chosenType);
                break;
            default:
                return response()->json([
                    'error' => 'ChosenAI is not valid',
                ], 400);
        }

        $data = [
            'codeReviewOrDocumentation' => $response
        ];
        broadcast(new BoardChange($boardId, "GENERATED_CODE_REVIEW_OR_DOCUMENTATION", $data));

        return $response;
    }

    public function generatePerformanceSummary(Request $request)
    {
        $user = auth()->user();

        $response = null;
        $chosenType = $request->header('ChosenType');

        switch ($request->header('ChosenAI')) {
            case Str::lower("llama"):
                $response = LlamaController::generatePerformanceSummary($request);
                break;
            case Str::lower("chatgpt"):
                $response = ChatGPTController::generatePerformanceSummary($request);
                break;
            default:
                return response()->json([
                    'error' => 'ChosenAI is not valid',
                ], 400);
        }
        return $response;
    }
}