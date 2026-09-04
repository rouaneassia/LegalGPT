<?php

namespace Tests\Feature;

use App\Models\Chat;
use App\Models\Favorite;
use App\Models\Folder;
use App\Models\GeneratedDocument;
use App\Models\Template;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Services\FolderAssignmentService;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserFavoritesFoldersTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_fetch_favorites_and_folders(): void
    {
        $user = User::factory()->create([
            'role' => 'user',
            'status' => 'active',
        ]);

        $chat = Chat::create([
            'user_id' => $user->id,
            'title' => 'Chat important',
        ]);

        $template = Template::create([
            'title' => 'Contrat de travail',
            'description' => 'Modèle de test',
        ]);

        $document = GeneratedDocument::create([
            'user_id' => $user->id,
            'template_id' => $template->id,
            'title' => 'Contrat type',
            'content' => 'Contenu du document',
            'language' => 'fr',
        ]);

        Favorite::create([
            'user_id' => $user->id,
            'chat_id' => $chat->id,
            'generated_document_id' => $document->id,
        ]);

        Folder::create([
            'user_id' => $user->id,
            'name' => 'Dossier juridique',
        ]);

        $documentsResponse = $this->actingAs($user, 'sanctum')->getJson('/api/user/documents');
        $documentsResponse->assertOk()
            ->assertJsonFragment(['success' => true])
            ->assertJsonFragment(['title' => 'Contrat type']);

        $favoritesResponse = $this->actingAs($user, 'sanctum')->getJson('/api/user/favorites');
        $favoritesResponse->assertOk()
            ->assertJsonFragment(['title' => 'Chat important'])
            ->assertJsonFragment(['title' => 'Contrat type']);

        $foldersResponse = $this->actingAs($user, 'sanctum')->getJson('/api/user/folders');
        $foldersResponse->assertOk()
            ->assertJsonFragment(['name' => 'Dossier juridique']);
    }

    public function test_chat_is_assigned_to_a_matching_folder_automatically(): void
    {
        $user = User::factory()->create([
            'role' => 'user',
            'status' => 'active',
        ]);

        $chat = Chat::create([
            'user_id' => $user->id,
            'title' => 'New Chat',
        ]);

        app(FolderAssignmentService::class)->assign(
            $chat,
            'Rédige-moi un contrat de travail',
            $user->id
        );

        $chat->refresh();
        $this->assertNotNull($chat->folder_id);
        $this->assertSame('Contrats Travail', $chat->folder->name);

        $folderResponse = $this->actingAs($user, 'sanctum')
            ->getJson('/api/user/folders/' . $chat->folder_id);

        $folderResponse->assertOk()
            ->assertJsonPath('name', 'Contrats Travail')
            ->assertJsonPath('chats.0.id', $chat->id);
    }

    public function test_regular_user_cannot_access_admin_api(): void
    {
        $user = User::factory()->create([
            'role' => 'user',
            'status' => 'active',
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/admin/dashboard')
            ->assertForbidden()
            ->assertJsonPath('success', false);
    }

    public function test_admin_login_rejects_regular_account(): void
    {
        $user = User::factory()->create([
            'email' => 'regular@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'status' => 'active',
        ]);

        $this->postJson('/api/admin/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertForbidden();
    }
}
