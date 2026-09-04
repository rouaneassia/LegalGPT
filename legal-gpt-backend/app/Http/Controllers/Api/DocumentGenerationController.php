<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Template;
use App\Models\GeneratedDocument;
use App\Models\Chat;
use App\Models\Message;
use App\Services\AI\OpenAIService;
use App\Services\PromptService;
use App\Services\FolderAssignmentService;
use Exception;
use Illuminate\Http\Client\RequestException;

class DocumentGenerationController extends Controller
{
    protected OpenAIService $aiService;
    protected PromptService $promptService;
    protected FolderAssignmentService $folderAssignmentService;

    public function __construct(
        OpenAIService $aiService,
        PromptService $promptService,
        FolderAssignmentService $folderAssignmentService
    )
    {
        $this->aiService = $aiService;
        $this->promptService = $promptService;
        $this->folderAssignmentService = $folderAssignmentService;
    }

    public function generate(Request $request)
    {
        $request->validate([
            'template_id' => 'sometimes|exists:templates,id',
            'prompt'      => 'required_without:user_inputs|string',
            'user_inputs' => 'sometimes|array', 
            'language'    => 'sometimes|in:ar,fr,en',
            'chat_id'     => 'nullable|exists:chats,id',
        ]);

        $templateId = $request->input('template_id', 1); 
        $template = Template::with('sections')->findOrFail($templateId);

        try {
            // 1. تحديد اللغة
            $language = $request->input('language');
            
            if (!$language) {
                $userInputs = $request->input('user_inputs', []);
                $firstKey = !empty($userInputs) ? array_key_first($userInputs) : null;
                if ($firstKey && preg_match('/[a-zA-Z]/', $firstKey)) {
                    $language = 'fr';
                } else {
                    $language = 'ar';
                }
            }

            // 2. تجميع الأقسام
            $sectionsData = $template->sections->map(function ($section, $index) {
                $num = $index + 1;
                return "--- Section {$num}: {$section->title} ---\nInstructions: {$section->content}";
            })->values()->implode("\n\n");

            $userInputsData = collect($request->input('user_inputs', []))
                ->map(fn($value, $key) => "- {$key}: {$value}")
                ->implode("\n");

            // 3. بناء الـ Prompt
            $languageInstruction = match ($language) {
                'fr' => "Rédigez l'intégralité du document EXCLUSIVEMENT en français juridique formel, structuré et professionnel. N'utilisez pas l'arabe.",
                'en' => "Write the document EXCLUSIVELY in formal legal English.",
                default => "اكتب الوثيقة حصرياً بلغة عربية قانونية رسمية ومحترفة.",
            };

            $instructions = <<<PROMPT
You are a professional legal assistant specialized in legal drafting.
Generate the document based on the following template: {$template->title}.
Template Description: {$template->description}

Here are the sections and instructions you must strictly follow:
{$sectionsData}

User Inputs to be integrated into the document:
{$userInputsData}

LANGUAGE INSTRUCTION (CRITICAL):
{$languageInstruction}

Please write the complete document, well-organized and formatted clearly using Markdown, strictly respecting the requested language.
PROMPT;

            // 4. الاتصال بالذكاء الاصطناعي
            $generatedText = $this->aiService->generate($instructions);

            if (!$generatedText) {
                return response()->json([
                    'success' => false,
                    'message' => 'فشل الاتصال بخدمة الذكاء الاصطناعي'
                ], 503);
            }

            $userId = $request->user()->id ?? 1;

            // 5. حفظ الوثيقة في جدول generated_documents
            $generatedDocument = GeneratedDocument::create([
                'user_id'     => $userId,
                'template_id' => $template->id,
                'title'       => $template->title,
                'content'     => $generatedText,
                'language'    => $language,
            ]);

            // 6. حفظ المحادثة و ربط الرسائل بـ content باش ما يوقش SQL Error 500
            $chatId = $request->input('chat_id');
            $userPrompt = $request->input('prompt') ?? ($request->user_inputs['demande'] ?? "Générer le document: {$template->title}");

            if (!$chatId) {
                $chat = Chat::create([
                    'user_id' => $userId,
                    'title' => mb_substr($userPrompt, 0, 30) . '...'
                ]);
                $chatId = $chat->id;
            } else {
                $chat = Chat::where('user_id', $userId)->findOrFail($chatId);
            }

            $this->folderAssignmentService->assign($chat, $userPrompt, $userId);

            if (class_exists(Message::class)) {
                Message::create([
                    'chat_id'  => $chatId,
                    'role'     => 'user',
                    'content'  => $userPrompt,
                ]);

                Message::create([
                    'chat_id'  => $chatId,
                    'role'     => 'assistant',
                    'content'  => $generatedText,
                ]);
            }

            return response()->json([
                'success' => true,
                'detected_language' => $language,
                'document' => $generatedText,
                'record' => $generatedDocument,
                'chat_id' => $chatId 
            ]);

        } catch (RequestException $e) {
    $statusCode = $e->response?->status() ?? 500;
    \Log::error("Gemini Request Exception: " . $e->getMessage());

    return response()->json([
        'success' => false,
        'message' => 'خطأ في خدمة الذكاء الاصطناعي',
        'error' => $e->getMessage()
    ], $statusCode);

} catch (Exception $e) {
    \Log::error("Document Generation Error: " . $e->getMessage());

    return response()->json([
        'success' => false,
        'message' => 'حدث خطأ أثناء توليد الوثيقة',
        'error' => $e->getMessage()
    ], 500);
}
    }

    public function adminIndex()
    {
        try {
            $documents = GeneratedDocument::with(['user', 'template'])->latest()->get();
            return response()->json($documents, 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}

