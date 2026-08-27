<?php

namespace App\Services\Search;

use Illuminate\Support\Collection;
use App\Services\LanguageService;
use App\Services\QueryTranslatorService;
use App\Services\StopWordsService;

class QueryAnalyzer
{
    public function __construct(
        protected LanguageService $language,
        protected QueryTranslatorService $translator,
        protected StopWordsService $stopWords,
    ) {
    }

    public function analyze(string $query): array
    {
        // 1. Détection de la langue
        $language = $this->language->detect($query);

        // 2. Traduction si nécessaire
        if ($language !== 'ar') {
            $query = $this->translator->translate($query);
        }

        // 3. Suppression du Tashkeel (diacritiques)
        $cleanQuery = preg_replace('/[\x{064B}-\x{065F}\x{0670}]/u', '', $query);

        // 4. Suppression explicite de toute ponctuation (\p{P}) et symboles (\p{S})
        $cleanQuery = preg_replace('/[\p{P}\p{S}]/u', ' ', $cleanQuery);

        // 5. Normalisation des espaces multiples
        $cleanQuery = trim(preg_replace('/\s+/u', ' ', $cleanQuery));

        // 6. Extraction des mots
        $rawWords = explode(' ', $cleanQuery);

        // 7. Nettoyage, filtrage par longueur et suppression des StopWords
        $words = collect($rawWords)
            ->map(fn($w) => trim($w))
            ->filter(fn($word) => mb_strlen($word) >= 2)
            ->values();

        $filteredWords = collect(
            $this->stopWords->remove($words->toArray())
        );

        return [
            'query' => $cleanQuery,
            'words' => $filteredWords
                ->unique()
                ->values(),
        ];
    }
}