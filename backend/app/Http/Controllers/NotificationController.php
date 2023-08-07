<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use App\Models\User;

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

    public function store(Request $request, $userId) {

        $user = auth()->user();
      
        if (!$user) {
          return response()->json(['error' => 'Unauthorized'], 401);
        }

        if ($user->user_id == $userId) {
            return response()->json(['error' => 'Cannot send notification to yourself'], 400); 
          }
      
        $validatedData = $request->validate([
          'type' => 'required',
          'content' => 'required',
          'is_read' => 'required|boolean'
        ]);
      
        try {  
      
          $user = User::findOrFail($userId);
          
          $notification = new Notification($validatedData);
          $notification->user_id = $userId;
          $notification->save();
      
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      
          return response()->json(['error' => 'User not found'], 404);  
      
        } catch (\Illuminate\Database\QueryException $e) {
          
          return response()->json(['error' => 'Database error: ' . $e->getMessage()], 500);
      
        } catch (\Illuminate\Validation\ValidationException $e) {
      
          return response()->json(['error' => 'Validation error: ' . $e->errors()], 422);
      
        } catch (\Exception $e) {
          return response()->json(['error' => 'Error saving notification: ' . $e->getMessage()], 500);
        }
      
        return response()->json(['message' => 'Notification created successfully'], 201);
      
      }
    
      public function update(Request $request, $notificationId) {

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
      
        $this->validate($request, [
          'is_read' => 'required|boolean'
        ]);
      
        $notification->is_read = $request->is_read;
      
        try {
          $notification->save();
        } catch (\Illuminate\Database\QueryException $e) {
          return response()->json(['error' => $e->getMessage()], 500);
        }
      
        return response()->json(['message' => 'Notification updated successfully'], 200);
      
      }

      public function destroy($notificationId) {

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
      
        return response()->json([
          'message' => 'Notification deleted successfully'
        ], 200);
      
      }




}
