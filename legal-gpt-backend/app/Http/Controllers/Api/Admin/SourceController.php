<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Source;
use Illuminate\Http\Request;
use App\Services\SourceSyncService;

class SourceController extends Controller
{
    // Afficher toutes les sources
    public function index(Request $request)
    {
        $sources = Source::with(['category', 'chunks']) // <-- زدنا category هنا
            ->when($request->search, function ($query, $search) {
                $query->where('title', 'LIKE', "%{$search}%");
            })
            ->latest()
            ->get(); // <-- استخدام get() بدل paginate باش ترجع Array مباشرة

        return response()->json($sources);
    }

    // Ajouter une nouvelle source
   public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'url'         => 'required|string', // بدلنا url بـ string باش ما يبقاش يعقد الامور في الروابط
            'type'        => 'required|in:pdf,website',
            'category_id' => 'nullable|exists:categories,id', // ربط الفئة
        ]);
        $source = Source::create($validated);

        return response()->json($source, 201);
    }

    // Afficher une source
    public function show(Source $source)
    {
        return response()->json($source->loadCount('chunks'));
    }

    // Modifier une source
   public function update(Request $request, Source $source)
    {
        $validated = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'url'         => 'sometimes|required|string', // بدلنا url بـ string هنا أيضا
            'type'        => 'sometimes|required|in:pdf,website',
            'active'      => 'boolean',
            'category_id' => 'nullable|exists:categories,id', // السماح بتعديل الفئة
        ]);

        $source->update($validated);

        return response()->json($source);
    }

    // Supprimer une source
    public function destroy(Source $source)
    {
        $source->delete();

        return response()->json([
            'message' => 'Source supprimée avec succès.'
        ]);
    }

    // Synchroniser une source
   // Synchroniser une source
    public function sync(Source $source, SourceSyncService $service)
    {
        // زيد هادو هنا في الأول باش يعطيو الوقت والذاكرة الكافيين للمعالجة
        ini_set('max_execution_time', 300);
        ini_set('memory_limit', '512M');

        try {
            $service->sync($source);

            return response()->json([
                'success' => true,
                'message' => 'Synchronization completed.',
                'source'  => $source->fresh(['chunks'])
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Synchronization failed.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}