<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\RequestException;

class OpenAIService
{
    public function generate(string $prompt): ?string
    {
        $apiKey = trim(config('services.gemini.api_key') ?? env('GEMINI_API_KEY'));
        $model = preg_replace(
            '#^models/#',
            '',
            trim(config('services.gemini.model', 'gemini-3-flash-preview'))
        );

        if (empty($apiKey)) {
            Log::error('Gemini API Error: GEMINI_API_KEY manquante.');
            return null;
        }

        try {
            // إضافة retry تلقائي 3 مرات في حالة خطأ 503 أو الضغط المؤقت
            $response = Http::retry(3, 2000, function ($exception) {
                if (!$exception instanceof RequestException) {
                    return false;
                }

                return in_array($exception->response?->status(), [503, 429], true);
            })->acceptJson()
                ->asJson()
                ->withoutVerifying()
                ->timeout(60)
                ->post(
                    "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}",
                    [
                        'contents' => [
                            [
                                'parts' => [
                                    ['text' => $prompt],
                                ],
                            ],
                        ],
                        'generationConfig' => [
                            'temperature' => 0.2,
                        ],
                    ]
                );

            if (! $response->successful()) {
                Log::error('Gemini API Error details', [
                    'status' => $response->status(),
                    'body'   => $response->json() ?? $response->body(),
                ]);

                return null;
            }

            return data_get(
                $response->json(),
                'candidates.0.content.parts.0.text'
            );

        } catch (\Throwable $e) {
            Log::error('Gemini Exception: ' . $e->getMessage());
            return null;
        }
    }
}