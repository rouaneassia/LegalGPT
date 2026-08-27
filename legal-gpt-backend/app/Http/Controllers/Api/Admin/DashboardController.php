<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Knowledge;
use App\Models\Chat;
use App\Models\GeneratedDocument;

class DashboardController extends Controller
{
    public function stats()
    {
        return response()->json([
            'users' => User::count(),
            'knowledge' => Knowledge::count(),
            'chats' => Chat::count(),
            'documents' => GeneratedDocument::count(),
        ]);
    }
}