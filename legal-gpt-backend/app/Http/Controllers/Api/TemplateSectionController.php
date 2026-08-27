<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TemplateSection;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TemplateSectionController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'template_id' => 'required|exists:templates,id',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'order' => 'nullable|integer',
        ]);

        $section = TemplateSection::create($validated);

        return response()->json([
            'message' => 'تم إضافة القسم بنجاح',
            'data' => $section
        ], 201);
    }

    public function update(Request $request, TemplateSection $section): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'order' => 'nullable|integer',
        ]);

        $section->update($validated);

        return response()->json([
            'message' => 'تم تحديث القسم بنجاح',
            'data' => $section
        ]);
    }

    public function destroy(TemplateSection $section): JsonResponse
    {
        $section->delete();
        return response()->json([
            'message' => 'تم حذف القسم بنجاح'
        ]);
    }
}