<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserController extends Controller
{
    public function checkLogin(Request $request)
    {
        try {
            if (!$user = JWTAuth::parseToken()->authenticate()) {
                return response()->json(['isLoggedIn' => false]);
            }
        } catch (Tymon\JWTAuth\Exceptions\TokenExpiredException $e) {
            return response()->json(['isLoggedIn' => false]);
        } catch (Tymon\JWTAuth\Exceptions\TokenInvalidException $e) {
            return response()->json(['isLoggedIn' => false]);
        } catch (Tymon\JWTAuth\Exceptions\JWTException $e) {
            return response()->json(['isLoggedIn' => false]);
        }
        return response()->json(['isLoggedIn' => true]);
    }

    public function signup(Request $request)
    {
        $emailExists = \App\Models\User::where('email', $request->email)->count();
    
        if ($emailExists > 0) {
            return response()->json(['error' => 'Email already exists'], 400);
        }
    
        $user = new \App\Models\User;
        $user->username = $request->username;
        $user->email = $request->email;
        $user->password = bcrypt($request->password);
        try {
            $user->save();
        } catch (\Illuminate\Database\QueryException $e) {
            return response()->json(['error' => 'Signup failed'], 500);
        }
    
        return response()->json(['message' => 'Signup successful']);
    }
    

    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        try {
            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json(['error' => 'Incorrect email address or password'], 400);
            }

            $user = JWTAuth::user();

        } catch (JWTException $e) {
            return response()->json(['error' => 'could_not_create_token'], 500);
        }

        return response()->json(['token' => $token, 'user' => $user]);
    }
    public function show()
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return response()->json([$user]);
    }

    public function update(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $oldPassword = $request->input('old_password');
        $newPassword = $request->input('new_password');

        // Ellenőrzés, hogy a régi jelszó helyes-e
        if (!Hash::check($oldPassword, $user->password)) {
            return response()->json(['error' => 'Incorrect old password'], 400);
        }

        if ($request->has('username') && User::where('username', $request->input('username'))->where('user_id', '!=', $user->user_id)->exists()) {
            return response()->json(['error' => 'Username already exists'], 400);
        }

        // Ellenőrzés, hogy az új email cím már létezik-e
        if ($request->has('email') && User::where('email', $request->input('email'))->where('user_id', '!=', $user->user_id)->exists()) {
            return response()->json(['error' => 'Email already exists'], 400);
        }

        $updateData = [
            'username' => $request->input('username', $user->username),
            'email' => $request->input('email', $user->email),
            // Egyéb mezők frissítése...
        ];

        if (!empty($newPassword)) {
            $updateData['password'] = Hash::make($newPassword);
        }

        $user->update($updateData);

        return response()->json(['message' => 'User data updated successfully'], 200);
    }


}