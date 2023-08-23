<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('summary_logs', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->text('summary');
            $table->json('logs');
            $table->integer('tasks_created_count');
            $table->integer('tasks_finished_count');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('summary_logs');
    }
};
