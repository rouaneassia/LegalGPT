<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('user')->after('email'); // دور المستخدم (admin أو user)
            $table->string('status')->default('active')->after('role'); // حالة الحساب (active أو inactive)
            $table->timestamp('last_login_at')->nullable()->after('status'); // آخر تسجيل دخول
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'status', 'last_login_at']);
        });
    }
};