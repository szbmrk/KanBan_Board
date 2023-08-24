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
            $table->id('crafted_prompt_id')->nullable(false);
            $table->text('crafted_prompt_title')->nullable(false);
            $table->unsignedBigInteger('board_id')->nullable(false);
            $table->unsignedBigInteger('agi_behavior_id')->nullable(true);
            $table->text('crafted_prompt_text')->nullable(false);
            $table->enum('craft_with', [
                'CHATGPT', 'LLAMA', 'BARD'
            ])->nullable(false);
            $table->enum('action', [
                'GENERATETASK', 'GENERATESUBTASK', 'GENERATEATTACHMENTLINK'
            ])->nullable(false);
            $table->unsignedBigInteger('response_counter')->nullable(false);
            $table->unsignedBigInteger('created_by')->nullable(false);
            $table->timestamps();

            // Add the onDelete('cascade') option to both foreign key definitions
            $table->foreign('board_id')->references('board_id')->on('boards')->onDelete('cascade');
            //instead of cascade, set the agi_behavior_id to null
            $table->foreign('agi_behavior_id')->references('agi_behavior_id')->on('agi_behaviors')->onDelete('set null');
            
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
