<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Prompt;

class PromptSeeder extends Seeder
{
    public function run(): void
    {
        Prompt::updateOrCreate(
            ['key' => 'default_legal'],
            [
                'title'         => 'Assistant Juridique Général',
                'description'   => 'Prompt standard pour répondre aux questions sur le droit marocain avec citations d’articles.',
                'system_prompt' => "Tu es un assistant juridique expert en droit marocain. Réponds à la question en te basant UNIQUEMENT sur les extraits juridiques fournis. Si l'information n'est pas présente, indique-le clairement.",
                'is_active'     => true,
            ]
        );
    }
}