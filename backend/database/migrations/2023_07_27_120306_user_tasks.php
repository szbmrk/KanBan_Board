<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('user_tasks', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable(false);
            $table->unsignedBigInteger('task_id')->nullable(false);
            $table->primary(['user_id', 'task_id']);

            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->foreign('task_id')->references('task_id')->on('tasks')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_tasks');
    }
};
