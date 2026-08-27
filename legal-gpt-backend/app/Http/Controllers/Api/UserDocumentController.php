<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\GeneratedDocument;
use Exception;

class UserDocumentController extends Controller
{
    // Jib ga3 les documents dyal l-user li m-connété (Generated Documents)
    public function index(Request $request)
    {
        try {
            $documents = GeneratedDocument::where('user_id', $request->user()->id)
                ->with('template')
                ->latest()
                ->get();

            return response()->json([
                'success' => true,
                'documents' => $documents
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Afficher un document précis
    public function show(Request $request, $id)
    {
        try {
            $document = GeneratedDocument::where('user_id', $request->user()->id)
                ->with('template')
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'document' => $document
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found'
            ], 404);
        }
    }

    // Supprimer document dyal l-user
    public function destroy(Request $request, $id)
    {
        try {
            $document = GeneratedDocument::where('user_id', $request->user()->id)->findOrFail($id);
            $document->delete();

            return response()->json([
                'success' => true,
                'message' => 'Document deleted successfully'
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found or unauthorized'
            ], 404);
        }
    }
}