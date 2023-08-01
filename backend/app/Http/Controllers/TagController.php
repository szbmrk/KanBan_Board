<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tag;

class TagController extends Controller
{
    public function index(Request $request)
    {
        
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $tags = Tag::orderBy('name')->get();

        return response()->json(['tags' => $tags]);
    }

    public function store(Request $request)
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'required|string|max:7',
        ]);

        $tag = Tag::create([
            'name' => $validatedData['name'],
            'color' => $validatedData['color'],
        ]);
        

        return response()->json(['message' => 'Tag created successfully'], 201);
    }

    public function update(Request $request, $id)
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'required|string|max:7',
        ]);

        $tag = Tag::where('tag_id', $id)->first();

        if (!$tag) {
            return response()->json(['message' => 'Tag not found'], 404);
        }

        $tag->name = $request->input('name');
        $tag->color = $request->input('color');
        $tag->save();

        return response()->json(['message' => 'Tag updated successfully']);
    }

    public function destroy($id)
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $tag = Tag::find($id);

        if (!$tag) {
            return response()->json(['message' => 'Tag not found'], 404);
        }

        $tag->delete();

        return response()->json(['message' => 'Tag deleted successfully']);
    }

}
