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
        Schema::table('sources', function (Blueprint $table) {
           $table->string('local_path')->nullable()->after('last_sync');

    $table->text('last_error')->nullable()->after('local_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sources', function (Blueprint $table) {
            
    $table->dropColumn([
        'local_path',
        'last_error'
    ]);
        });
    }
};
