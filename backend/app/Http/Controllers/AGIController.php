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
use App\Models\UserAgiUsage;
use Illuminate\Support\Facades\Event;


class AGIController extends Controller
{
    public static function GenerateTask(Request $request)
    {
        $user = auth()->user();

        $response = null;

        switch ($request->header('ChosenAI')) {
            case Str::lower("chatgpt"):
                if ($request->header('Draft') == true) {
                    $response = ChatGPTController::GenerateTaskDraftChatGPT($request);
                    break;
                }
                $craftedPrompt = null;
                $response = ChatGPTController::GenerateTaskChatGPT($request, $craftedPrompt);
                break;
            case Str::lower(value: "kanban-llm"):
                return response()->json([
                    'error' => 'This llm is still under development',
                ], 404);
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
            case Str::lower("chatgpt"):
                $response = ChatGPTController::GenerateSubtaskChatGPT($request);
                break;
            case Str::lower(value: "kanban-llm"):
                return response()->json([
                    'error' => 'This llm is still under development',
                ], 404);
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
            case "chatgpt draft":
                $response = ChatGPTController::GenerateTaskDraftChatGPT($request);
                break;
            case Str::lower("chatgpt"):
                $response = ChatGPTController::GenerateTaskChatGPT($request);
                break;
            case Str::lower(value: "kanban-llm"):
                return response()->json([
                    'error' => 'This llm is still under development',
                ], 404);
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
            case Str::lower("chatgpt"):
                $response = ChatGPTController::GenerateAttachmentLinkNotCraftedChatGPT($request);
                break;
            case Str::lower(value: "kanban-llm"):
                return response()->json([
                    'error' => 'This llm is still under development',
                ], 404);
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
            case Str::lower("chatgpt"):
                $response = ChatGPTController::GenerateTaskDocumentationPerTask($boardId, $taskId);
                break;
            case Str::lower(value: "kanban-llm"):
                return response()->json([
                    'error' => 'This llm is still under development',
                ], 404);
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
            case Str::lower("chatgpt"):
                $response = ChatGPTController::GenerateTaskDocumentationPerBoard($boardId);
                break;
            case Str::lower(value: "kanban-llm"):
                return response()->json([
                    'error' => 'This llm is still under development',
                ], 404);
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
            case Str::lower("chatgpt"):
                $response = ChatGPTController::GenerateTaskDocumentationPerColumn($boardId, $taskId);
                break;
            case Str::lower(value: "kanban-llm"):
                return response()->json([
                    'error' => 'This llm is still under development',
                ], 404);
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


        switch ($request->header('ChosenAI')) {
            case Str::lower("chatgpt"):
                $response = ChatGPTController::GenerateCodeReviewOrDocumentation($request, $boardId, $chosenType);
                break;
            case Str::lower(value: "kanban-llm"):
                return response()->json([
                    'error' => 'This llm is still under development',
                ], 404);
            default:
                return response()->json([
                    'error' => 'ChosenAI is not valid',
                ], 400);
        }

        $data = [
            'codeReviewOrDocumentation' => $response
        ];
        broadcast(new BoardChange($boardId, "GENERATED_CODE_REVIEW_OR_DOCUMENTATION", $data));

        try {
            $userAgiUsage = UserAgiUsage::where('user_id', $user->user_id)->first();
            if ($response && !$response->has('error')) {
                if ($userAgiUsage) {
                    $userAgiUsage->incrementCounter();
                } else {
                    UserAgiUsage::create([
                        'user_id' => $user->user_id,
                        'counter' => 1,
                    ]);
                }
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An error occurred: ' . $e->getMessage(),
            ], 500);
        }


        return $response;
    }

    public function generatePerformanceSummary(Request $request)
    {
        $user = auth()->user();

        $response = null;
        $chosenType = $request->header('ChosenType');

        switch ($request->header('ChosenAI')) {
            case Str::lower("chatgpt"):
                $response = ChatGPTController::generatePerformanceSummary($request);
                break;
            case Str::lower(value: "kanban-llm"):
                return response()->json([
                    'error' => 'This llm is still under development',
                ], 404);
            default:
                return response()->json([
                    'error' => 'ChosenAI is not valid',
                ], 400);
        }
        return $response;
    }
}