<?php

namespace App\Services;

use App\Models\Chat;
use App\Models\Message;
use Illuminate\Support\Collection;

class MessageService
{
    /**
     * إنشاء Chat جديد إذا لم يكن موجوداً.
     */
    public function getOrCreate(?int $chatId = null): Chat
    {
        if ($chatId) {

            $chat = Chat::find($chatId);

            if ($chat) {
                return $chat;
            }
        }

       return Chat::create([
            'user_id' => auth('sanctum')->id(), 
            'title' => 'New Chat',
        ]);
    }

    /**
     * حفظ رسالة.
     */
    public function save(
        Chat $chat,
        string $role,
        string $content
    ): Message {

        return Message::create([
            'chat_id' => $chat->id,
            'role' => $role,
            'content' => $content,
        ]);
    }

    /**
     * آخر الرسائل (Conversation Memory).
     */
    public function history(
        Chat $chat,
        int $limit = 10
    ): Collection {

        return $chat->messages()
            ->latest()
            ->take($limit)
            ->get()
            ->reverse()
            ->values();
    }
}