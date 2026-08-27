<?php

namespace App\Services\AI;

use App\Models\Embedding;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EmbeddingService
{
    /**
     * Generate and store embedding for a knowledge chunk.
     */
    public function generateAndStore($chunk)
    {
        try {
            // 1. استدعاء الـ API لتوليد الـ Embedding (مثلاً Gemini API أو OpenAI)
            $vectorData = $this->callEmbeddingApi($chunk->content);

            if (!empty($vectorData)) {
                // 2. حفظ أو تحديث الـ Embedding في الجدول الجديد
                Embedding::updateOrCreate(
                    ['knowledge_chunk_id' => $chunk->id],
                    [
                        'embedding' => json_encode($vectorData),
                        'model' => 'text-embedding-004', // أو النموذج المعتمد عندك
                    ]
                );
            }
        } catch (\Exception $e) {
            Log::error("Error generating embedding for chunk {$chunk->id}: " . $e->getMessage());
        }
    }

    /**
     * API Call to get vector array
     */
    private function callEmbeddingApi(string $text)
    {
        // مثال لاستدعاء API (يمكنك تعديل الرابط والمفتاح حسب إعدادات المشروع ديالك)
        $apiKey = config('services.gemini.key'); // أو مفتاح OpenAI
        
        // ملاحظة: ضع هنا الرابط والكود الفعلي للـ API الخاص بالـ Embeddings الذي تستخدمه
        // هذا مثال توضيحي لهيكل الطلب:
        /*
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post("https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={$apiKey}", [
            'model' => 'models/text-embedding-004',
            'content' => [
                'parts' => [['text' => $text]]
            ]
        ]);

        if ($response->successful()) {
            return $response->json()['embedding']['values'] ?? [];
        }
        */

        // مؤقتاً للتجربة ريثما تربط الـ API الفعلي:
        return array_fill(0, 1536, 0.1); // مصفوفة وهمية للتأكد من اشتغال التخزين
    }
}