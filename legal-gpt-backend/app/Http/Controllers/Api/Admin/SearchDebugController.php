<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\Search\QueryAnalyzer;
use App\Services\Search\CandidateRetriever;
use App\Services\Search\Ranker;
use App\Services\SnippetService;

class SearchDebugController extends Controller
{
    public function __construct(
        protected QueryAnalyzer $queryAnalyzer,
        protected CandidateRetriever $candidateRetriever,
        protected Ranker $ranker,
        protected SnippetService $snippetService
    ) {}

    /**
     * Inspecte l'exécution complète du Search Engine étape par étape
     */
    public function debug(Request $request)
    {
        $request->validate([
            'query' => 'required|string',
        ]);

        $rawQuery = $request->input('query');

        // Étape 1 : Analyse de la requête
        $analyzedQuery = $this->queryAnalyzer->analyze($rawQuery);

        // Étape 2 : Récupération des candidats
        $candidates = $this->candidateRetriever->retrieve($analyzedQuery);

        // Étape 3 : Ranking / Scorage
        $rankedCandidates = $this->ranker->rank($candidates, $analyzedQuery);

        // Étape 4 : Génération des Snippets
        $snippets = $this->snippetService->generate($rankedCandidates, $analyzedQuery);

        return response()->json([
            'raw_query'        => $rawQuery,
            'analyzed_query'   => $analyzedQuery,
            'candidates_count' => $candidates->count(),
            'ranked_results'   => $rankedCandidates,
            'final_snippets'   => $snippets,
        ]);
    }
}