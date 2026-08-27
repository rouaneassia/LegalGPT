<?php

namespace App\Services;

class SnippetService
{
    public function extract(
        string $content,
        string $query,
        int $radius = 250
    ): string {
        if (empty(trim($content))) {
            return '';
        }

        // 1. Nettoyer la requête (suppression ponctuation)
        $cleanQuery = preg_replace('/[\p{P}\p{S}]/u', ' ', $query);
        $cleanQuery = trim(preg_replace('/\s+/u', ' ', $cleanQuery));

        // 2. Extraire les mots-clés de la requête (mots d'au moins 3 lettres)
        $words = array_filter(
            explode(' ', $cleanQuery),
            fn($word) => mb_strlen($word) >= 3
        );

        $position = false;

        // 3. Chercher la position de la phrase complète, sinon du premier mot-clé significatif
        if (!empty($cleanQuery)) {
            $position = mb_stripos($content, $cleanQuery);
        }

        if ($position === false && !empty($words)) {
            foreach ($words as $word) {
                $pos = mb_stripos($content, $word);
                if ($pos !== false) {
                    $position = $pos;
                    break;
                }
            }
        }

        // Fallback : Début du contenu si aucun mot n'est trouvé
        if ($position === false) {
            return mb_substr($content, 0, 500);
        }

        // 4. Calcul de la plage de capture
        $start = max(0, $position - $radius);
        $length = mb_strlen($query) + ($radius * 2);

        $snippet = mb_substr($content, $start, $length);

        // 5. Ajuster le début et la fin sur des espaces (éviter de couper des mots)
        if ($start > 0) {
            $firstSpace = mb_strpos($snippet, ' ');
            if ($firstSpace !== false) {
                $snippet = '...' . mb_substr($snippet, $firstSpace + 1);
            }
        }

        if (($start + $length) < mb_strlen($content)) {
            $lastSpace = mb_strrpos($snippet, ' ');
            if ($lastSpace !== false) {
                $snippet = mb_substr($snippet, 0, $lastSpace) . '...';
            }
        }

        return trim($snippet);
    }
}