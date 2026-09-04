<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Folder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FolderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $folders = Folder::where('user_id', $request->user()->id)
            ->withCount('chats')
            ->latest()
            ->get();

        return response()->json($folders);
    }

    public function show(Request $request, $id): JsonResponse
    {
        $folder = Folder::where('user_id', $request->user()->id)
            ->with(['chats' => fn ($query) => $query
                ->with('messages')
                ->orderBy('updated_at', 'desc')])
            ->findOrFail($id);

        return response()->json($folder);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'min:2'],
        ]);

        $name = trim($validated['name']);

        $folder = Folder::firstOrCreate([
            'user_id' => $request->user()->id,
            'name' => $name,
        ]);

        return response()->json($folder, 201);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $folder = Folder::where('user_id', $request->user()->id)->findOrFail($id);
        $folder->delete();

        return response()->json(['message' => 'Dossier supprimé']);
    }
}