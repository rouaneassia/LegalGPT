<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ChatService;
use App\Models\Chat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function __construct(
        protected ChatService $chatService
    ) {}

    public function ask(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'question' => 'required|string|min:2',
            'chat_id'  => 'nullable|integer|exists:chats,id',
        ]);

        $result = $this->chatService->ask(
            $validated['question'],
            $validated['chat_id'] ?? null
        );

        return response()->json($result);
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $chats = Chat::with(['user', 'messages'])
            ->latest()
            ->get();

        return response()->json($chats);
    }

    public function userChats(Request $request)
    {
        $chats = Chat::where('user_id', $request->user()->id)
                     ->with('messages') 
                     ->orderBy('updated_at', 'desc')
                     ->get();

        return response()->json($chats);
    }
}