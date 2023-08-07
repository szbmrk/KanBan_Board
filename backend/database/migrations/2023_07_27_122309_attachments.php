<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('attachments', function (Blueprint $table) {
            $table->id('attachment_id');
            $table->string('link', 255)->nullable(false);
            $table->text('description')->nullable();
            $table->unsignedBigInteger('task_id')->nullable(false);
            $table->timestamps();
            
            $table->foreign('task_id')->references('task_id')->on('tasks')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('attachments');
    }
};
