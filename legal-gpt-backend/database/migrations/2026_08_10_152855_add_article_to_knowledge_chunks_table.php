<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('knowledge_chunks', function (Blueprint $table) {

            $table->string('article')
                ->nullable()
                ->after('page');

        });
    }

    public function down(): void
    {
        Schema::table('knowledge_chunks', function (Blueprint $table) {

            $table->dropColumn('article');

        });
    }
};