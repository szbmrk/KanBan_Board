<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id('role_id');
            $table->string('name', 255)->nullable(false);
            $table->unsignedBigInteger('board_id')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();

            $table->foreign('board_id')->references('board_id')->on('boards')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('roles');
    }
};