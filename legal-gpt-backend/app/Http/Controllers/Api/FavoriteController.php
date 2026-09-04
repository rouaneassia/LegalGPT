<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $favorites = Favorite::where('user_id', $request->user()->id)
            ->with(['chat', 'document'])
            ->latest()
            ->get();

        return response()->json($favorites);
    }

    public function toggle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'chat_id' => ['nullable', 'integer', 'exists:chats,id'],
            'generated_document_id' => ['nullable', 'integer', 'exists:generated_documents,id'],
        ]);

        if (empty($validated['chat_id']) && empty($validated['generated_document_id'])) {
            return response()->json([
                'message' => 'Vous devez fournir un chat ou un document valide.',
            ], 422);
        }

        $userId = $request->user()->id;

        $favorite = Favorite::where('user_id', $userId)
            ->when($validated['chat_id'] ?? null, fn ($query) => $query->where('chat_id', $validated['chat_id']))
            ->when($validated['generated_document_id'] ?? null, fn ($query) => $query->where('generated_document_id', $validated['generated_document_id']))
            ->first();

        if ($favorite) {
            $favorite->delete();

            return response()->json([
                'status' => 'removed',
                'message' => 'Retiré des favoris',
            ]);
        }

        $newFavorite = Favorite::create([
            'user_id' => $userId,
            'chat_id' => $validated['chat_id'] ?? null,
            'generated_document_id' => $validated['generated_document_id'] ?? null,
        ]);

        return response()->json([
            'status' => 'added',
            'data' => $newFavorite->load(['chat', 'document']),
        ], 201);
    }
}