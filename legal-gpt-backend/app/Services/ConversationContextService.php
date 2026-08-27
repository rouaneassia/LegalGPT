<?php

namespace App\Services;

use Illuminate\Support\Collection;

class ConversationContextService
{
    public function rewrite(
        string $question,
        Collection $history
    ): string {

        // إذا ما كايناش محادثة
        if ($history->isEmpty()) {
            return $question;
        }

        $question = trim($question);

        // كلمات تدل على أن السؤال تابع لما قبله
        $followUps = [
            'من',
            'ومن',
            'ما',
            'وما',
            'كم',
            'وكم',
            'متى',
            'ومتى',
            'أين',
            'وأين',
            'هل',
            'وهل',
            'كيف',
            'وكيف',
            'لماذا',
            'ولماذا'
        ];

        $isFollowUp = false;

        foreach ($followUps as $word) {
            if (str_starts_with($question, $word)) {
                $isFollowUp = true;
                break;
            }
        }

        if (!$isFollowUp) {
            return $question;
        }

        // أول سؤال في المحادثة
        $firstQuestion = $history
            ->where('role', 'user')
            ->first();

        if (!$firstQuestion) {
            return $question;
        }

        return $firstQuestion->content.' '.$question;
    }
}