<?php

namespace App\Services\Search;

use Illuminate\Support\Collection;

class Ranker
{
    public function rank(Collection $chunks, Collection $words): Collection
    {
        return $chunks
            ->map(function ($chunk) use ($words) {

                $score = 0;

                foreach ($words as $word) {

                    $score += substr_count(
                        mb_strtolower($chunk->content),
                        mb_strtolower($word)
                    );

                }

                $chunk->score = $score;

                return $chunk;

            })
            ->sortByDesc('score')
            ->values();
    }
}