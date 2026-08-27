<?php

namespace App\Services\Search;

use App\Models\KnowledgeChunk;
use Illuminate\Support\Collection;

class CandidateRetriever
{
    public function retrieve(Collection $words): Collection
    {
        if ($words->isEmpty()) {
            return collect();
        }

        $builder = KnowledgeChunk::query()
            ->with('source');

        foreach ($words as $index => $word) {

            if ($index == 0) {

                $builder->where(function ($q) use ($word) {

                    $q->where('content', 'LIKE', "%{$word}%")
                      ->orWhereHas('source', function ($s) use ($word) {

                          $s->where('title', 'LIKE', "%{$word}%");

                      });

                });

            } else {

                $builder->orWhere(function ($q) use ($word) {

                    $q->where('content', 'LIKE', "%{$word}%")
                      ->orWhereHas('source', function ($s) use ($word) {

                          $s->where('title', 'LIKE', "%{$word}%");

                      });

                });

            }

        }

        return $builder
            ->limit(300)
            ->get();
    }
}