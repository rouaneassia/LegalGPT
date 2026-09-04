<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\TemplateController;
use App\Http\Controllers\Api\TemplateSectionController;
use App\Http\Controllers\Api\DocumentGenerationController;
use App\Http\Controllers\Api\UserDocumentController; 

use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\KnowledgeController;
use App\Http\Controllers\Api\Admin\SourceController;
use App\Http\Controllers\Api\Admin\SearchDebugController;
use App\Http\Controllers\Api\Admin\PromptController;
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\InstructionController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Api\FolderController;
use App\Http\Controllers\Api\FavoriteController;


// --- 1. Public Routes ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/admin/login', [AuthController::class, 'adminLogin']);
Route::post('/chat/ask', [ChatController::class, 'ask']);

// --- 2. Authenticated User Routes (Sanctum) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);

    // Chat History
    Route::get('/user/chats', [ChatController::class, 'userChats']);
    Route::delete('/user/chats/{chat}', [ChatController::class, 'destroy']); // <-- Zid hadi hda userChats
    
    // Document Generation for normal users
    Route::post('/generate-document', [DocumentGenerationController::class, 'generate']);
    
    // User Documents
    Route::get('/user/documents', [UserDocumentController::class, 'index']);
    Route::post('/user/documents', [UserDocumentController::class, 'store']);
    // Folders API
    Route::get('/user/folders', [FolderController::class, 'index']);
    Route::get('/user/folders/{id}', [FolderController::class, 'show']);
    Route::post('/user/folders', [FolderController::class, 'store']);
    Route::delete('/user/folders/{id}', [FolderController::class, 'destroy']);

    // Favorites API
    Route::get('/user/favorites', [FavoriteController::class, 'index']);
    Route::post('/user/favorites/toggle', [FavoriteController::class, 'toggle']);
});

// --- 3. Protected & Admin Routes ---
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/admin/dashboard', [DashboardController::class, 'stats']);
    Route::apiResource('admin/sources', SourceController::class);
    Route::post('admin/sources/{source}/sync', [SourceController::class, 'sync']);
    Route::get('/admin/knowledge', [KnowledgeController::class, 'index']);
    Route::get('/admin/knowledge/chunks/{id}', [KnowledgeController::class, 'showChunk']);
    Route::get('/admin/knowledge/articles', [KnowledgeController::class, 'articles']);
    Route::delete('/admin/knowledge/{id}', [KnowledgeController::class, 'destroy']);
    Route::post('/admin/search/debug', [SearchDebugController::class, 'debug']);
    Route::get('/admin/prompts', [PromptController::class, 'index']);
    Route::put('/admin/prompts/{id}', [PromptController::class, 'update']);
    Route::get('/admin/instructions', [InstructionController::class, 'index']);
    Route::post('/admin/instructions', [InstructionController::class, 'store']);
    Route::put('/admin/instructions/{id}', [InstructionController::class, 'update']);
    Route::delete('/admin/instructions/{id}', [InstructionController::class, 'destroy']);
    Route::apiResource('admin/categories', CategoryController::class);
    Route::apiResource('admin/templates', TemplateController::class);
    Route::apiResource('admin/template-sections', TemplateSectionController::class)->except(['index', 'show']);

    Route::post('/admin/generate-document', [DocumentGenerationController::class, 'generate']);
    Route::get('/admin/generated-documents', [DocumentGenerationController::class, 'adminIndex']);
    Route::get('/admin/user-documents', [UserDocumentController::class, 'adminIndex']);
    Route::delete('/admin/user-documents/{id}', [UserDocumentController::class, 'destroy']);

    Route::get('/admin/users', [UserController::class, 'index']);
    Route::put('/admin/users/{id}/role', [UserController::class, 'updateRole']);
    Route::put('/admin/users/{id}/status', [UserController::class, 'updateStatus']);
    Route::delete('/admin/users/{id}', [UserController::class, 'destroy']);
    Route::get('/admin/chats', [ChatController::class, 'adminIndex']);
});