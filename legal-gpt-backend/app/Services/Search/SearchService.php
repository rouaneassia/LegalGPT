<?php

namespace App\Services\Search;

use Illuminate\Support\Collection;
use App\Services\SnippetService;

class SearchService
{
    public function __construct(
        protected QueryAnalyzer $analyzer,
        protected CandidateRetriever $retriever,
        protected Ranker $ranker,
        protected SnippetService $snippet,
    ) {
    }

    public function search(string $query, int $limit = 5): Collection
    {
        $analysis = $this->analyzer->analyze($query);

        $query = $analysis['query'];

        $words = $analysis['words'];

        if ($words->isEmpty()) {
            return collect();
        }

        $chunks = $this->retriever->retrieve($words);

        if ($chunks->isEmpty()) {
            return collect();
        }

        $chunks = $this->ranker->rank($chunks, $words);

        $chunks = $chunks->map(function ($chunk) use ($query) {

            $chunk->content = $this->snippet->extract(
                $chunk->content,
                $query
            );

            return $chunk;

        });

        return $chunks
            ->take($limit)
            ->values();
    }
}