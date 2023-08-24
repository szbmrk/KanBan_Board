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
        Schema::create('agi_answers', function (Blueprint $table) {
            $table->id('agi_answer_id')->nullable(false);
            $table->enum('codeReviewOrDocumentationType', ['DOCUMENTATION', 'CODE REVIEW'])->nullable(true);
            $table->text('codeReviewOrDocumentation')->nullable(true);
            $table->text('taskDocumentation')->nullable(true);
            $table->unsignedBigInteger('task_id')->nullable(true);
            $table->unsignedBigInteger('board_id')->nullable(false);
            $table->unsignedBigInteger('column_id')->nullable(true);
            $table->unsignedBigInteger('user_id')->nullable(false);
            $table->timestamps();

            $table->foreign('task_id')->references('task_id')->on('tasks')->onDelete('cascade');
            $table->foreign('board_id')->references('board_id')->on('boards')->onDelete('cascade');
            $table->foreign('column_id')->references('column_id')->on('columns')->onDelete('cascade');
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agi_answers');
    }
};
