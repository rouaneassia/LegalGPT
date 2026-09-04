<?php

namespace App\Services;

use App\Models\Chat;
use App\Models\Folder;

class FolderAssignmentService
{
    public function assign(Chat $chat, string $question, int $userId): ?Folder
    {
        if ($chat->folder_id !== null) {
            return $chat->folder;
        }

        $folderName = $this->folderNameFor($question);

        if ($folderName === null) {
            return null;
        }

        $folder = Folder::firstOrCreate([
            'user_id' => $userId,
            'name' => $folderName,
        ]);

        $chat->update(['folder_id' => $folder->id]);

        return $folder;
    }

    private function folderNameFor(string $question): ?string
    {
        $question = mb_strtolower($question, 'UTF-8');

        if ($this->containsAny($question, [
            'contrat', 'travail', 'cdi', 'cdd', 'emploi', 'salari',
            'bail', 'loyer', 'location', 'licenciement', 'employeur',
        ])) {
            return 'Contrats Travail';
        }

        if ($this->containsAny($question, [
            'tribunal', 'tribunaux', 'mahkama', 'محكمة', 'قضية', 'قضايا',
            'loi', 'القانون', 'article', 'المادة', 'plainte', 'procès',
            'procedure', 'procédure', 'juridique', 'القضائية',
        ])) {
            return 'Dossiers Juridiques';
        }

        return null;
    }

    private function containsAny(string $question, array $keywords): bool
    {
        foreach ($keywords as $keyword) {
            if (str_contains($question, mb_strtolower($keyword, 'UTF-8'))) {
                return true;
            }
        }

        return false;
    }
}
