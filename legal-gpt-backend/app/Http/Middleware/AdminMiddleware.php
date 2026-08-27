<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // التحقق واش المستخدم مسجل دخول وعندو الدور 'admin' والحالة 'active'
        if ($request->user() && $request->user()->role === 'admin' && $request->user()->status === 'active') {
            return $next($request);
        }

        return response()->json([
            'success' => false,
            'message' => 'غير مخول لك بالوصول إلى هذه الصفحة. صلاحيات مدير النظام مطلوبة.'
        ], 403);
    }
}