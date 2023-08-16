<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Validator;
use App\Models\Role;
use App\Models\Permission;

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
    
            $userRole = Role::where('name', 'User')->first();
            if ($userRole) {
                $user->roles()->attach($userRole->role_id); // Módosítás itt
    
                // Ha nem szeretnéd, hogy minden új felhasználóra a "user_permission" engedély is hozzárendelődjön,
                // akkor hagyd ki az alábbi részt, vagy alkalmazz valamilyen logikát az engedély hozzáadására.
                $userPermission = Permission::where('name', 'user_permission')->first();
                if ($userPermission && !$userRole->permissions->contains($userPermission->id)) {
                    $userRole->permissions()->attach($userPermission->id);
                }
            }
    
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
    
            $roles = $user->getRoles();
            $permissions = $user->getPermissions();
    
        } catch (JWTException $e) {
            return response()->json(['error' => 'could_not_create_token'], 500);
        }
    
        return response()->json(['token' => $token, 'user' => $user]);
    }
}