<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('task_tags', function (Blueprint $table) {
            $table->id('task_tag_id');
            $table->unsignedBigInteger('tag_id')->nullable(false);
            $table->unsignedBigInteger('task_id')->nullable(false);
            $table->unsignedBigInteger('board_id')->nullable(false);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();


            $table->foreign('board_id')->references('board_id')->on('boards')->onDelete('cascade');
            $table->foreign('tag_id')->references('tag_id')->on('tags')->onDelete('cascade');
            $table->foreign('task_id')->references('task_id')->on('tasks')->onDelete('cascade');

        });
    }

    public function down()
    {
        Schema::dropIfExists('task_tags');
    }
};
