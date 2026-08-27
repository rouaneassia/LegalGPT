<?php

namespace App\Services;

class LanguageService
{
    /**
     * Detect question language: ar / fr / en
     */
    public function detect(string $text): string
    {
        $text = trim($text);

        if ($text === '') {
            return 'ar';
        }

        /*
        |--------------------------------------------------------------------------
        | Arabic
        |--------------------------------------------------------------------------
        */

        if (preg_match('/[\x{0600}-\x{06FF}]/u', $text)) {
            return 'ar';
        }

        $text = mb_strtolower($text);

        /*
        |--------------------------------------------------------------------------
        | English phrases
        |--------------------------------------------------------------------------
        */

        $englishPhrases = [
            'what is',
            'what are',
            'who is',
            'who are',
            'how',
            'why',
            'tell me',
            'explain',
            'define',
            'definition',
            'constitutional court',
            'supreme court',
            'high court',
            'law',
            'legal',
        ];

        foreach ($englishPhrases as $phrase) {
            if (str_contains($text, $phrase)) {
                return 'en';
            }
        }

        /*
        |--------------------------------------------------------------------------
        | English words
        |--------------------------------------------------------------------------
        */

        $englishWords = [
            'what',
            'which',
            'who',
            'where',
            'when',
            'how',
            'why',
            'explain',
            'define',
            'definition',
            'court',
            'constitutional',
            'supreme',
            'government',
            'president',
            'minister',
            'law',
            'legal',
            'article',
            'constitution',
            'morocco',
        ];

        foreach ($englishWords as $word) {

            if ($this->containsWord($text, $word)) {
                return 'en';
            }
        }

        /*
        |--------------------------------------------------------------------------
        | French phrases
        |--------------------------------------------------------------------------
        */

        $frenchPhrases = [
            'cour constitutionnelle',
            'cour suprême',
            'tribunal administratif',
            'conseil constitutionnel',
            'qu est ce que',
            'qu est-ce que',
            'définition de',
            'explique moi',
            'expliquez moi',
        ];

        foreach ($frenchPhrases as $phrase) {

            if (str_contains($text, $phrase)) {
                return 'fr';
            }
        }

        /*
        |--------------------------------------------------------------------------
        | French words
        |--------------------------------------------------------------------------
        */

        $frenchWords = [
            'bonjour',
            'quelle',
            'quelles',
            'quel',
            'quels',
            'comment',
            'pourquoi',
            'loi',
            'tribunal',
            'justice',
            'droit',
            'nomination',
            'définition',
            'définir',
            'explique',
            'expliquez',
            'france',
            'maroc',
        ];

        foreach ($frenchWords as $word) {

            if ($this->containsWord($text, $word)) {
                return 'fr';
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Default
        |--------------------------------------------------------------------------
        */

        return 'en';
    }

    /**
     * Check exact word instead of substring.
     *
     * Example:
     * constitution != constitutional
     */
    private function containsWord(string $text, string $word): bool
    {
        return preg_match(
            '/(?:^|\s)' . preg_quote($word, '/') . '(?:\s|$)/u',
            $text
        ) === 1;
    }
}