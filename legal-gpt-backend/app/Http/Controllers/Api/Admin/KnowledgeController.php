<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\KnowledgeChunk;
use App\Models\Article;
use Illuminate\Http\Request;

class KnowledgeController extends Controller
{
    // Navigation / Recherche dans les Chunks
    public function index(Request $request)
    {
        $chunks = KnowledgeChunk::with('source:id,title')
            ->when($request->source_id, function ($query, $sourceId) {
                $query->where('source_id', $sourceId);
            })
            ->when($request->search, function ($query, $search) {
                $query->where('content', 'LIKE', "%{$search}%");
            })
            ->latest()
            ->paginate(15);

        return response()->json($chunks);
    }

    // Navigation / Recherche dans les Articles
    public function articles(Request $request)
    {
        $articles = Article::with('source:id,title')
            ->when($request->source_id, function ($query, $sourceId) {
                $query->where('source_id', $sourceId);
            })
            ->when($request->search, function ($query, $search) {
                $query->where('article_number', 'LIKE', "%{$search}%")
                      ->orWhere('content', 'LIKE', "%{$search}%");
            })
            ->latest()
            ->paginate(15);

        return response()->json($articles);
    }

    // Afficher un Chunk spécifique
    public function showChunk($id)
    {
        $chunk = KnowledgeChunk::with('source')->findOrFail($id);

        return response()->json($chunk);
    }

    public function destroy($id)
{
    $chunk = KnowledgeChunk::findOrFail($id);
    $chunk->delete();

    return response()->json([
        'success' => true,
        'message' => 'تم الحذف بنجاح'
    ]);
}
}