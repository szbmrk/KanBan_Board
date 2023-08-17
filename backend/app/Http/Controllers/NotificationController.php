<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Validator;

class NotificationController extends Controller
{
    public function index($userId)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        if ($user->user_id != $userId) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $notifications = $user->notifications;

        if ($notifications->isEmpty()) {
            return response()->json(['message' => 'No notifications found for this user'], 404);
        }

        return response()->json($notifications);
    }


    public function show($userId, $notificationId)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $notification = Notification::find($notificationId);

        if (!$notification) {
            return response()->json(['error' => 'Notification not found'], 404);
        }

        if ($notification->user_id != $userId) {
            return response()->json(['error' => 'Notification is not associated with this user'], 400);
        }

        return response()->json($notification);
    }

    public function store(Request $request, $userId)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        if ($user->user_id == $userId) {
            return response()->json(['error' => 'Cannot send notification to yourself'], 400);
        }

        $validator = Validator::make($request->all(), [
            'type' => 'required|in:BOARD,SYSTEM,TEAM',
            'content' => 'required',
            'is_read' => 'required|in:0,1|boolean',
        ]);

        if ($validator->fails()) {
            $errors = $validator->errors();
            $response = ['error' => 'Validation error'];

            if ($errors->has('type')) {
                $response['details']['type'] = $errors->get('type');
            }

            if ($errors->has('content')) {
                $response['details']['content'] = $errors->get('content');
            }

            if ($errors->has('is_read')) {
                $response['details']['is_read'] = $errors->get('is_read');
            }

            return response()->json($response, 422);
        }

        try {
            $user = User::findOrFail($userId);

            $notification = new Notification($request->all());
            $notification->user_id = $userId;
            $notification->save();

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'User not found'], 404);
        } catch (\Illuminate\Database\QueryException $e) {
            return response()->json(['error' => 'Database error: ' . $e->getMessage()], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error saving notification: ' . $e->getMessage()], 500);
        }

        return response()->json(['message' => 'Notification created successfully'], 201);

    }

    public function update(Request $request, $notificationId)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $notification = Notification::find($notificationId);

        if (!$notification) {
            return response()->json(['error' => 'Notification not found'], 404);
        }

        if ($notification->user_id != $user->user_id) {
            return response()->json(['error' => 'You can only edit your own notifications'], 403);
        }

        $validator = Validator::make($request->all(), [
            'type' => 'in:BOARD,SYSTEM,TEAM',
            'content' => '',
            'is_read' => 'required|in:0,1|boolean',
        ]);

        if ($validator->fails()) {
            $errors = $validator->errors();
            $response = ['error' => 'Validation error'];

            if ($errors->has('type')) {
                $response['details']['type'] = $errors->get('type');
            }

            if ($errors->has('content')) {
                $response['details']['content'] = $errors->get('content');
            }

            if ($errors->has('is_read')) {
                $response['details']['is_read'] = $errors->get('is_read');
            }

            return response()->json($response, 422);
        }

        try {
            $notification->is_read = $request->input('is_read', $notification->is_read);
            $notification->save();
        } catch (\Illuminate\Database\QueryException $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }

        return response()->json(['message' => 'Notification updated successfully', 'notification' => $notification], 200);

    }

    public function destroy($notificationId)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $notification = Notification::find($notificationId);

        if (!$notification) {
            return response()->json(['error' => 'Notification not found'], 404);
        }

        if ($notification->user_id != $user->user_id) {
            return response()->json(['error' => 'You can only delete your own notifications'], 403);
        }

        try {

            $notification->delete();

        } catch (\Illuminate\Database\QueryException $e) {

            return response()->json(['error' => $e->getMessage()], 500);

        }

        return response()->json(['message' => 'Notification deleted successfully'], 200);
    }

}