<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TemplateController extends Controller
{
    // عرض جميع القوالب مع الأقسام التابعة لها
    public function index(): JsonResponse
    {
        $templates = Template::with('sections')->latest()->get();
        return response()->json($templates);
    }

    // إضافة قالب جديد
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $template = Template::create($validated);

        return response()->json([
            'message' => 'تم إنشاء القالب بنجاح',
            'data' => $template
        ], 201);
    }

    // عرض قالب معين بأقسامه
    public function show(Template $template): JsonResponse
    {
        $template->load('sections');
        return response()->json($template);
    }

    // تعديل قالب
    public function update(Request $request, Template $template): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $template->update($validated);

        return response()->json([
            'message' => 'تم تعديل القالب بنجاح',
            'data' => $template
        ]);
    }

    // حذف قالب
    public function destroy(Template $template): JsonResponse
    {
        $template->delete();
        return response()->json([
            'message' => 'تم حذف القالب بنجاح'
        ]);
    }
}