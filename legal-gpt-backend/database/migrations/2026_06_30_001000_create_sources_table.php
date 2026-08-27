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
       Schema::create('sources', function (Blueprint $table) {

    $table->id();

    $table->string('title');

   $table->text('url');

    $table->enum('type', ['pdf', 'website'])->default('pdf');

    $table->boolean('active')->default(true);

    $table->timestamp('last_sync')->nullable();

    $table->timestamps();

});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sources');
    }
};
