<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id('task_id');
            $table->string('title', 100)->nullable(false);
            $table->text('description')->nullable();
            $table->timestamp('due_date')->nullable();
            $table->unsignedBigInteger('board_id');
            $table->unsignedBigInteger('column_id')->nullable(false);
            $table->unsignedBigInteger('project_id')->nullable();
            $table->unsignedBigInteger('priority_id')->nullable();
            $table->unsignedBigInteger('parent_task_id')->nullable();
            $table->float('position')->nullable(false);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();

            $table->foreign('board_id')->references('board_id')->on('boards')->onDelete('cascade');
            $table->foreign('column_id')->references('column_id')->on('columns')->onDelete('cascade');
            $table->foreign('parent_task_id')->references('task_id')->on('tasks')->onDelete('cascade');
            $table->foreign('priority_id')->references('priority_id')->on('priorities')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('tasks');
    }
};
