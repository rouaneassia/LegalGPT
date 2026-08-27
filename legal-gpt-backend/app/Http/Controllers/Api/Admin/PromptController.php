<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Prompt;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PromptController extends Controller
{
    /**
     * Liste tous les templates de prompts configurés
     */
    public function index(): JsonResponse
    {
        $prompts = Prompt::latest()->get();

        return response()->json($prompts);
    }

    /**
     * Afficher les détails d'un prompt
     */
    public function show(Prompt $prompt): JsonResponse
    {
        return response()->json($prompt);
    }

    /**
     * Mettre à jour les instructions système d'un prompt
     */
    public function update(Request $request, Prompt $prompt): JsonResponse
    {
        $validated = $request->validate([
            'title'         => 'sometimes|required|string|max:255',
            'description'   => 'nullable|string',
            'system_prompt' => 'required|string',
            'is_active'     => 'boolean',
        ]);

        $prompt->update($validated);

        return response()->json([
            'message' => 'Prompt mis à jour avec succès.',
            'prompt'  => $prompt
        ]);
    }
}