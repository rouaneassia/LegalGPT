<?php

namespace App\Services;

use App\Services\AI\OpenAIService;

class QueryTranslatorService
{
    public function __construct(
        protected OpenAIService $aiService
    ) {
    }

    public function translate(string $question): string
    {
        $prompt = <<<PROMPT
أنت مترجم متخصص.

ترجم السؤال التالي إلى اللغة العربية الفصحى فقط.

القواعد:
- لا تجب عن السؤال.
- لا تشرح.
- لا تضف كلمات مفتاحية.
- لا تضف أي معلومات إضافية.
- أخرج الترجمة العربية فقط.

السؤال:
{$question}

الترجمة:
PROMPT;

        return trim(
            $this->aiService->generate($prompt)
        );
    }
}