<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Validator;

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

        $token = JWTAuth::fromUser($user);

        return response()->json(['token' => $token]);
    }


    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if ($token = JWTAuth::attempt($credentials)) {
            $user = Auth::user();
            $user->token = $token;
            $user->save();

            return response()->json(['token' => $token]);
        } else {
            return response()->json(['error' => 'Invalid credentials'], 400);
        }
    }
}