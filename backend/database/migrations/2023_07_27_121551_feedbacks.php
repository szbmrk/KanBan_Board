<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('feedbacks', function (Blueprint $table) {
            $table->id('feedback_id');
            $table->unsignedBigInteger('task_id')->nullable(false);
            $table->unsignedBigInteger('user_id')->nullable(false);
            $table->enum('difficulty_level', ['VERY EASY', 'EASY', 'MEDIUM', 'HARD', 'VERY HARD'])->nullable(false);
            $table->enum('user_rating', ['1', '2', '3', '4', '5'])->nullable(false);
            $table->text('text')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();

            $table->foreign('task_id')->references('task_id')->on('tasks')->onDelete('cascade');
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('feedbacks');
    }
};
