<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('chats', function (Blueprint $table) {

            // الإضافة تتم فقط إذا لم يكن العمود موجوداً مسبقاً
            if (!Schema::hasColumn('chats', 'user_id')) {
                $table->foreignId('user_id')
                    ->nullable()
                    ->after('id')
                    ->constrained()
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('chats', 'title')) {
                $table->string('title')
                    ->default('New Chat')
                    ->after('id');
            }

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chats', function (Blueprint $table) {

            if (Schema::hasColumn('chats', 'user_id')) {
                $table->dropForeign(['user_id']);
                $table->dropColumn('user_id');
            }

            if (Schema::hasColumn('chats', 'title')) {
                $table->dropColumn('title');
            }

        });
    }
};