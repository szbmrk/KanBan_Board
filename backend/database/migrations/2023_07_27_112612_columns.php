<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('columns', function (Blueprint $table) {
            $table->id('column_id');
            $table->string('name', 50)->nullable(false);
            $table->unsignedInteger('position')->nullable(false);
            $table->unsignedBigInteger('board_id')->nullable(false);
            $table->boolean('is_finished')->default(false);
            $table->integer('task_limit')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();

            $table->foreign('board_id')->references('board_id')->on('boards');
        });
    }

    public function down()
    {
        Schema::dropIfExists('columns');
    }
};
