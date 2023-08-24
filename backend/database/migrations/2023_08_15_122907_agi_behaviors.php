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
        
        Schema::create('agi_behaviors', function (Blueprint $table) {
            $table->id('agi_behavior_id')->nullable(false);
            $table->text('act_as_a')->nullable(true);
            $table->unsignedBigInteger('board_id')->nullable(false);

            $table->timestamps();
            
            $table->foreign('board_id')->references('board_id')->on('boards')->onDelete('cascade');

        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agi_behaviors');
    }
};
