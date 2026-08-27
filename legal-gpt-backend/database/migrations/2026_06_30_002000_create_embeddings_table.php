<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('embeddings', function (Blueprint $table) {
            $table->id();
            
            // الربط الصحيح والمضمون (استبدل 'knowledge_chunks' بأسماء الجدول الحقيقي اللي بغيتي تربط بيه)
            $table->foreignId('knowledge_chunk_id')
                  ->constrained('knowledge_chunks') // تأكد بلي اسم الجدول صحيح
                  ->onDelete('cascade');

            $table->longText('embedding'); 
            $table->string('model')->nullable(); 
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('embeddings');
    }
};