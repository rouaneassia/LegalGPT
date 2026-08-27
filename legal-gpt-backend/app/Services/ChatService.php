<?php

namespace App\Services;

use App\Services\AI\AIService;
use App\Http\Resources\SourceCitationResource;
use App\Services\Search\SearchService;

class ChatService
{
    public function __construct(
        protected SearchService $searchService,
        protected AIService $aiService,
        protected LanguageService $languageService,
        protected MessageService $messageService,
        protected ConversationContextService $contextService,
    ) {
    }

    /**
     * Handle a user question inside a conversation.
     */
    public function ask(
        string $question,
        ?int $chatId = null
    ): array {

        // ---------------------------------------------------------
        // 1. Nettoyer la question
        // ---------------------------------------------------------
        $question = trim($question);

        if ($question === '') {
            return [
                'chat_id' => $chatId,
                'answer' => 'Veuillez saisir une question.',
                'language' => 'ar',
                'sources' => [],
            ];
        }

        // ---------------------------------------------------------
        // 2. Créer ou récupérer la conversation
        // ---------------------------------------------------------
        $chat = $this->messageService->getOrCreate($chatId);

        // ---------------------------------------------------------
        // 3. Détecter la langue de la question
        // ---------------------------------------------------------
        $language = $this->languageService->detect($question);

        // ---------------------------------------------------------
        // 4. Récupérer l'historique AVANT d'enregistrer la question
        //    (Évite d'avoir la question actuelle en doublon dans l'historique)
        // ---------------------------------------------------------
        $history = $this->messageService->history($chat);

        // ---------------------------------------------------------
        // 5. Sauvegarder la question utilisateur en BDD
        // ---------------------------------------------------------
        $this->messageService->save(
            $chat,
            'user',
            $question
        );

        // ---------------------------------------------------------
        // 6. Réécrire la question selon l'historique
        // ---------------------------------------------------------
        $searchQuestion = $this->contextService->rewrite(
            $question,
            $history
        );

        // Sécurité: si rewrite retourne vide
        if (empty(trim($searchQuestion))) {
            $searchQuestion = $question;
        }

        // ---------------------------------------------------------
        // 7. Recherche dans la base juridique
        // ---------------------------------------------------------
        $chunks = $this->searchService->search(
            $searchQuestion
        );

        // ---------------------------------------------------------
        // 8. Génération de la réponse AI
        // ---------------------------------------------------------
        $answer = $this->aiService->answer(
            $question,
            $chunks,
            $history,
            $language
        );

        // ---------------------------------------------------------
        // 9. Sauvegarder la réponse assistant en BDD
        // ---------------------------------------------------------
        $this->messageService->save(
            $chat,
            'assistant',
            $answer
        );

        // ---------------------------------------------------------
        // 10. Donner un titre à la conversation (si nouveau chat)
        // ---------------------------------------------------------
        if (empty($chat->title) || $chat->title === 'New Chat') {
            $cleanTitle = preg_replace('/\s+/', ' ', $question);

            $chat->update([
                'title' => mb_substr($cleanTitle, 0, 60)
            ]);
        }

        // ---------------------------------------------------------
        // 11. Retour API
        // ---------------------------------------------------------
        return [
            'chat_id' => $chat->id,
            'answer' => $answer,
            'language' => $language,
            'sources' => SourceCitationResource::collection($chunks)->resolve(),
        ];
    }
}