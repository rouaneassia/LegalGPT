<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Exception;

class UserController extends Controller
{
    /**
     * جلب قائمة جميع المستخدمين
     */
   public function index(Request $request)
{
    try {
        $currentUserId = $request->user()->id; // هاد السيد اللي داخل دابا (الأدمن)

        $users = User::select('id', 'name', 'email', 'role', 'status', 'created_at', 'last_login_at')
            ->where('id', '!=', $currentUserId) // استثناء الأدمن اللي داير Login حالياً
            ->where('role', '!=', 'admin')      // استثناء أي أدمن آخر (إيلا كانو شي وحدين آخرين)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'users'   => $users
        ], 200);
    } catch (Exception $e) {
        return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
    }
}

    /**
     * تغيير دور المستخدم (Admin / User)
     */
    public function updateRole(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|in:admin,user',
        ]);

        try {
            $user = User::findOrFail($id);
            $user->role = $request->role;
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث دور المستخدم بنجاح',
                'user'    => $user
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'تعذر تحديث الدور: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * تفعيل أو تعطيل حساب المستخدم (Active / Inactive)
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:active,inactive',
        ]);

        try {
            $user = User::findOrFail($id);
            $user->status = $request->status;
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث حالة الحساب بنجاح',
                'user'    => $user
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'تعذر تحديث الحالة: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * حذف مستخدم
     */
    public function destroy($id)
    {
        try {
            $user = User::findOrFail($id);
            
            // حماية: عدم السماح للـ Admin بحذف نفسه
            if (auth()->id() == $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'لا يمكنك حذف حسابك الحالي!'
                ], 400);
            }

            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'تم حذف المستخدم بنجاح'
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'تعذر حذف المستخدم: ' . $e->getMessage()
            ], 500);
        }
    }
}