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
        Schema::create('crafted_prompts', function (Blueprint $table) {
            $table->id('crafted_prompt_id');
            $table->unsignedBigInteger('board_id')->nullable(false);
            $table->text('crafted_prompt_text')->nullable();
            $table->enum('carft_with', [
                'chatgpt', 'llama', 'bard'
            ])->nullable(false);
            $table->unsignedBigInteger('created_by')->nullable(false);

            // Add the onDelete('cascade') option to both foreign key definitions
            $table->foreign('board_id')->references('board_id')->on('boards')->onDelete('cascade');
            $table->foreign('created_by')->references('user_id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crafted_prompts');
    }
};