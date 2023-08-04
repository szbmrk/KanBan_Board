<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Role;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        if (!$user) { 
                return response()->json(['error' => 'Unauthorized'], 401); 
        } 
            
        $roles = Role::all();

        if ($roles->isEmpty()) {
            return response()->json(['error' => 'No roles found'], 404);
        }

        return response()->json(['roles' => $roles]);
    }

    public function store(Request $request) {

        $user = auth()->user();
        if (!$user) { 
                return response()->json(['error' => 'Unauthorized'], 401); 
        } 

        $name = $request->input('name');
        if (!$name) {
            return response()->json(['error' => 'Please provide a name for the role'], 422);
        }
      
        $existing = DB::table('roles')->where('name', $name)->first();
        
        if ($existing) {
          return response()->json(['error' => 'Role already exists'], 422);
        }
      
        DB::insert('insert into roles (name) values (?)', [$name]);
        
        return response()->json([
           'message' => 'Role created successfully'
        ], 201);
      }
      
    public function update(Request $request, $id) {
        $user = auth()->user();
        if (!$user) { 
                return response()->json(['error' => 'Unauthorized'], 401); 
        } 

        $input = $request->json()->all();
        $name = $input['name'];

        if(empty($name)) {
            return response()->json(['error' => 'Name is required'], 422);
        }

        try 
        {
            $role = Role::findOrFail($id);
        } 
        catch (\Illuminate\Database\Eloquent\ModelNotFoundException) 
        {
            return response()->json(['error' => 'Role not found'], 404);
        }

        if($role->name === $name) {
            return response()->json([
              'error' => 'Cannot update role to the same name'
            ], 422);
        }

        $existing = Role::where('name', $name)
                        ->where('role_id', '!=', $id)
                        ->first();
                        
        if($existing) {
            return response()->json(['error' => 'Role already exists'], 422);
        }
        
        $role->name = $name;
        $role->save();

        return response()->json([
            'message' => 'Role updated successfully'
        ], 200);

    }

    public function destroy($id) {
        
        $user = auth()->user();
        if (!$user) { 
                return response()->json(['error' => 'Unauthorized'], 401); 
        } 

        try 
        {
            $role = Role::findOrFail($id);
        } 
        catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) 
        {
            return response()->json(['error' => 'Role not found'], 404);
        }

        $role->delete();

        return response()->json(['message' => 'Role deleted successfully'], 200);
    }
        

}
