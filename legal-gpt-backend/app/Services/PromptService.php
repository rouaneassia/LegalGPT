<?php

namespace App\Services;

use App\Models\Prompt;
use Illuminate\Support\Collection;

class PromptService
{
    public function build(
        string $question,
        Collection $chunks,
        Collection $history,
        string $language = 'ar'
    ): string {

        // 1. استرجاع الـ System Prompt من قاعدة البيانات أو استخدام Fallback احترافي
        $dbPrompt = Prompt::where('key', 'default_legal')
            ->where('is_active', true)
            ->first();

        $basePrompt = $dbPrompt ? $dbPrompt->system_prompt : <<<TEXT
You are LegalGPT, an expert AI legal assistant specialized in Moroccan law.

STRICT GUIDELINES:
1. Answer the user's question by synthesizing and analyzing the provided legal documents. 
2. NEVER do raw copy-pasting of long legal texts or decisions. Write a structured, clear, and professional response using Markdown (bullet points, bold text, numbered lists).
3. Automatically correct any spelling errors or OCR text encoding issues found in the sources.
4. Base your answer EXCLUSIVELY on the provided legal documents. Do not add external knowledge.
5. If the exact answer is not present in the documents, reply ONLY with the designated fallback message according to the selected language.
6. Systematically cite the legal articles or sources at the end of your explanation.
TEXT;

        // 2. معالجة الـ Chunks (Context) وترتيبها حسب الأهمية
        $context = $chunks
            ->sortByDesc('score')
            ->take(5)
            ->map(function ($chunk) {
                $title = $chunk->source?->title ?? 'Unknown Source';
                $page = $chunk->page ?? '-';
                $article = $chunk->article ?? '-';

                return <<<TEXT
----------------------------------------
Source Title: {$title}
Page: {$page}
Article: {$article}
----------------------------------------
{$chunk->content}
TEXT;
            })
            ->implode("\n\n");

        // 3. معالجة تاريخ المحادثة (History) للحفاظ على السياق
        $conversation = $history
            ->take(-6)
            ->map(function ($message) {
                $role = $message->role === 'user' ? 'User' : 'Assistant';
                return "{$role}: {$message->content}";
            })
            ->implode("\n");

        // 4. إرشادات اللغة والـ Fallback الدقيق حسب لغة المستخدم
        $languageInstruction = match ($language) {
            'fr' => "Rédigez la réponse exclusivement en français. Si l'information est introuvable, répondez UNIQUEMENT : \"Je n'ai pas trouvé cette information dans la base de connaissances juridiques.\"",
            'en' => "Write the answer exclusively in English. If the information is not found, reply ONLY: \"I could not find this information in the legal knowledge base.\"",
            default => "اكتب الإجابة حصرياً بلغة عربية فصحى قانونية سليمة ومسبوكة. إذا لم تجد المعلومة، أجب حرفياً وبدقة فقط بالعبارة التالية: \"لم أجد هذه المعلومة داخل قاعدة المعرفة القانونية.\"",
        };

        // 5. تجميع الـ Prompt النهائي بشكل مهيكل ومنظم
        return <<<PROMPT
{$basePrompt}

---
LANGUAGE & FALLBACK INSTRUCTION:
{$languageInstruction}

---
CONVERSATION HISTORY:
{$conversation}

---
REFERRED LEGAL DOCUMENTS:
{$context}

---
USER QUESTION:
{$question}
PROMPT;
    }
}