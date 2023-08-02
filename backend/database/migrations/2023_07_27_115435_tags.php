<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('tags', function (Blueprint $table) {
            $table->id('tag_id');
            $table->string('name', 255)->nullable(false);
            $table->string('color', 7)->nullable(false);
            $table->unsignedBigInteger('board_id')->nullable(false);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();

            $table->foreign('board_id')->references('board_id')->on('boards');
        });
    }

    public function down()
    {
        Schema::dropIfExists('tags');
    }
};
