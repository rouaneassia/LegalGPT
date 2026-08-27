<?php

namespace App\Services\AI;

use App\Services\PromptService;
use Illuminate\Support\Collection;

class AIService
{
    public function __construct(
        protected PromptService $promptService,
        protected OpenAIService $openAIService
    ) {
    }

    public function answer(
        string $question,
        Collection $chunks,
        Collection $history,
        string $language = 'ar'
    ): string {

        /*
        |--------------------------------------------------------------------------
        | إذا البحث ما لقى والو
        |--------------------------------------------------------------------------
        */

        if ($chunks->isEmpty()) {

            return match ($language) {

                'fr' => "Je n'ai trouvé aucune information dans la base de connaissances juridique.",

                'en' => "I couldn't find this information in the legal knowledge base.",

                default => "لم أجد هذه المعلومة داخل قاعدة المعرفة القانونية.",
            };
        }

        /*
        |--------------------------------------------------------------------------
        | Build Prompt
        |--------------------------------------------------------------------------
        */

        $prompt = $this->promptService->build(
            $question,
            $chunks,
            $history,
            $language
        );

        /*
        |--------------------------------------------------------------------------
        | Ask Gemini
        |--------------------------------------------------------------------------
        */

        $answer = $this->openAIService->generate($prompt);

        /*
        |--------------------------------------------------------------------------
        | إذا Gemini طاح (429 أو أي Error)
        |--------------------------------------------------------------------------
        */

        if (blank($answer)) {

            $text = $chunks
                ->pluck('content')
                ->unique()
                ->take(3)
                ->implode("\n\n");

            if (blank($text)) {

                return match ($language) {

                    'fr' => "Le service d'intelligence artificielle est temporairement indisponible.",

                    'en' => "The AI service is temporarily unavailable.",

                    default => "خدمة الذكاء الاصطناعي غير متوفرة حاليا.",
                };
            }

            return $text;
        }

        return $answer;
    }
}