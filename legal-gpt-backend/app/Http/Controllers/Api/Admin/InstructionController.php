<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Instruction;
use Illuminate\Http\Request;

class InstructionController extends Controller
{
    public function index()
    {
        return response()->json(Instruction::all());
    }

    public function store(Request $request)
    {
        $instruction = Instruction::create([
            'title' => $request->title,
            'content' => $request->content,
            'is_active' => $request->is_active ?? true,
        ]);

        return response()->json([
            'message' => 'تم إضافة التعليمات بنجاح',
            'instruction' => $instruction
        ]);
    }

    public function update(Request $request, $id)
    {
        $instruction = Instruction::findOrFail($id);
        
        $instruction->update([
            'title' => $request->title,
            'content' => $request->content,
            'is_active' => $request->is_active,
        ]);

        return response()->json([
            'message' => 'تم التعديل بنجاح',
            'instruction' => $instruction
        ]);
    }

    public function destroy($id)
    {
        Instruction::destroy($id);
        return response()->json(['message' => 'تم الحذف بنجاح']);
    }
}