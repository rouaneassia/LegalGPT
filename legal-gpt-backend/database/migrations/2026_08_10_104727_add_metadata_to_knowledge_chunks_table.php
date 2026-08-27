<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('knowledge_chunks', function (Blueprint $table) {

            $table->integer('page')
                ->nullable()
                ->after('chunk_index');

            $table->json('metadata')
                ->nullable()
                ->after('characters');

        });
    }

    public function down(): void
    {
        Schema::table('knowledge_chunks', function (Blueprint $table) {

            $table->dropColumn('page');
            $table->dropColumn('metadata');

        });
    }
};