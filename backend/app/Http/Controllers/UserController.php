<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Models\TeamMember;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use App\Events\TeamChange;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules;

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
        // Check if the email or username already exists
        $emailExists = \App\Models\User::where('email', $request->email)->count();
        if ($emailExists > 0) {
            return response()->json(['error' => 'Email already exists'], 400);
        }

        $usernameExists = \App\Models\User::where('username', $request->username)->count();
        if ($usernameExists > 0) {
            return response()->json(['error' => 'Username already exists'], 400);
        }

        // Create the user
        $user = new \App\Models\User;
        $user->username = $request->username;
        $user->email = $request->email;
        $user->password = bcrypt($request->password);

        try {
            $user->save();

            // Add user to the team_members table
            $teamMember = new TeamMember();
            $teamMember->user_id = $user->user_id;
            $teamMember->save();

            // Attach roles and permissions
            $userRole = Role::where('name', 'User')->first();
            if ($userRole) {
                $teamMember->roles()->attach($userRole->role_id);

                $userPermission = Permission::where('name', 'user_permission')->first();
                if ($userPermission && !$userRole->permissions->contains($userPermission->id)) {
                    $userRole->permissions()->attach($userPermission->id);
                }
            }

            // Send email verification
            $user->sendEmailVerificationNotification();

            // TEMPORARY
            $user->email_verified_at = now();

        } catch (\Illuminate\Database\QueryException $e) {
            return response()->json(['error' => 'Signup failed', 'details' => $e->getMessage()], 500);
        }

        return response()->json(['message' => 'Signup successful! Please verify your email address.']);
    }

    public function login(Request $request)
    {
        $emailOrUsername = $request->input('email');
        $password = $request->input('password');

        // Check if the provided email looks like an email address
        $isEmail = filter_var($emailOrUsername, FILTER_VALIDATE_EMAIL);

        // Construct the credentials array based on whether it's an email or username
        $credentials = $isEmail
            ? ['email' => $emailOrUsername, 'password' => $password]
            : ['username' => $emailOrUsername, 'password' => $password];

        try {
            // Check if the credentials are correct
            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json(['error' => 'Incorrect email address, username, or password'], 400);
            }

            // Retrieve the authenticated user
            $user = JWTAuth::user();

            // Check if the user has verified their email
            if (is_null($user->email_verified_at)) {
                return response()->json(['error' => 'Your email address is not verified. Please check your email for the verification link.'], 403);
            }

            // Fetch user roles and permissions
            $roles = $user->getRoles();
            $permissions = $user->getPermissions();

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

    public function destroy(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $password = $request->input('password');
        $userId = $user->user_id;

        if (!Hash::check($password, $user->password)) {
            return response()->json(['error' => 'Incorrect password'], 400);
        }

        $user_ids = TeamMember::whereIn('team_id', function ($query) use ($userId) {
            $query->select('team_id')
                ->from('team_members')
                ->where('user_id', $userId);
        })
            ->where('user_id', '<>', $userId)
            ->distinct()
            ->pluck('user_id')
            ->toArray();

        $user->teamMembers()->delete();
        $user->userTasks()->delete();
        $user->favouriteTasks()->delete();
        $user->delete();

        $data = [
            'user' => $user
        ];
        foreach ($user_ids as $user_id) {
            broadcast(new TeamChange($user_id, "DELETED_USER", $data));
        }

        return response()->json(['message' => 'User deleted successfully'], 200);
    }

    public function showPermissions()
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $userPermissions = [];

        foreach ($user->teamMembers as $teamMember) {
            foreach ($teamMember->roles as $role) {
                foreach ($role->permissions as $permission) {
                    $permissionData = [
                        'permission' => $permission->name,
                        'team_id' => $teamMember->team_id,
                        'board_id' => $role->board_id,
                        'team_members_id' => $teamMember->team_members_id
                    ];

                    $userPermissions[] = $permissionData;
                }
            }
        }

        return response()->json(['permissions' => $userPermissions]);
    }

    /* Test email & username */

    public function checkEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $emailExists = User::where('email', $request->email)->exists();

        if ($emailExists) {
            return response()->json(['exists' => true]);
        }

        return response()->json(['exists' => false]);
    }

    public function checkUsername(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:255',
        ]);

        $usernameExists = User::where('username', $request->username)->exists();

        if ($usernameExists) {
            return response()->json(['exists' => true]);
        }

        return response()->json(['exists' => false]);
    }

    public function sendResetLinkEmail(Request $request)
    {
        // Validate the incoming request
        $request->validate(['email' => 'required|email']);

        // Attempt to send the reset link to this user
        $status = Password::sendResetLink(
            $request->only('email')
        );

        // Return response based on the result
        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => __($status)], 200)
            : response()->json(['email' => __($status)], 400);
    }

    public function resetPassword(Request $request)
    {
        // Validate the form input
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Attempt to reset the password
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                // Set the new password
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();
            }
        );

        // Return response based on the result
        return $status === Password::PASSWORD_RESET
            ? response()->json(['message' => __($status)], 200)
            : response()->json(['email' => [__($status)]], 400);
    }

    public function verify(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        // Verify that the hash in the URL matches the user's email hash
        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return response()->json(['message' => 'Invalid verification link.'], 403);
        }

        // If the user is already verified
        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.'], 200);
        }

        // Mark the user's email as verified
        $user->markEmailAsVerified();

        event(new Verified($user));

        return response()->json(['message' => 'Email verified successfully.'], 200);
    }

}