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

            $table->foreign('tag_id')->references('tag_id')->on('tags');
            $table->foreign('task_id')->references('task_id')->on('tasks');
        });
    }

    public function down()
    {
        Schema::dropIfExists('task_tags');
    }
};
