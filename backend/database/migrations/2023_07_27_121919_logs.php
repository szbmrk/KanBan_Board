<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('logs', function (Blueprint $table) {
            $table->id('log_id');
            $table->unsignedBigInteger('user_id')->nullable(false);
            $table->enum('action', [
                'UPDATED TEAM', 'DELETED TEAM', 'CREATED TEAM',
                'UPDATED COLUMN', 'DELETED COLUMN', 'CREATED COLUMN',
                'UPDATED BOARD', 'DELETED BOARD', 'CREATED BOARD',
                'UPDATED TASK', 'DELETED TASK', 'CREATED TASK', 'FINISHED TASK', 'COMMENTED ON TASK'
            ])->nullable(false);
            $table->text('details')->nullable();
            $table->unsignedBigInteger('task_id')->nullable();
            $table->unsignedBigInteger('board_id')->nullable();
            $table->unsignedBigInteger('team_id')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();

            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->foreign('task_id')->references('task_id')->on('tasks')->onDelete('cascade');
            $table->foreign('board_id')->references('board_id')->on('boards')->onDelete('cascade');
            $table->foreign('team_id')->references('team_id')->on('teams')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('logs');
    }
};
