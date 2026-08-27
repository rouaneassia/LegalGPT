<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('knowledge_chunks', function (Blueprint $table) {

            $table->id();

            $table->foreignId('source_id')
                  ->constrained()
                  ->cascadeOnDelete();

            $table->integer('chunk_index');

            $table->longText('content');

            $table->integer('characters')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('knowledge_chunks');
    }
};