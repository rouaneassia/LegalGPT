<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\AI\OpenAIService;

class TestGemini extends Command
{
    protected $signature = 'test:gemini';
    protected $description = 'Teste la connexion à l\'API Gemini';

    public function handle(OpenAIService $aiService)
    {
        $this->info("=== Test de connexion à Gemini API ===");
        
        $prompt = "Réponds en une phrase : Quel est le rôle de la Cour Constitutionnelle ?";
        $this->line("Prompt envoyé : {$prompt}\n");

        $response = $aiService->generate($prompt);

        if ($response) {
            $this->info(" Succès ! Réponse reçue de Gemini :");
            $this->warn($response);
        } else {
            $this->error(" Échec de l'appel API. Vérifiez storage/logs/laravel.log pour voir l'erreur.");
        }
    }
}