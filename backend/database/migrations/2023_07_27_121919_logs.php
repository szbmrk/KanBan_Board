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
                'UPDATED TEAM', 'DELETED TEAM', 'CREATED TEAM', 'TEAM NOT FOUND',
                'UPDATED COLUMN', 'DELETED COLUMN', 'CREATED COLUMN','COLUMN NOT FOUND',
                'UPDATED BOARD', 'DELETED BOARD', 'CREATED BOARD','BOARD NOT FOUND', 'BOARD ERROR',
                'SYSTEM ERROR',
                'USER ERROR', 'UPDATED USER', 'DELETED USER', 'CREATED USER',
                'AUTHENTICATION ERROR', 'NO PERMISSION',
                'UPDATED TASK', 'DELETED TASK', 'CREATED TASK', 'FINISHED TASK', 'COMMENTED ON TASK'
            ])->nullable(false);
            $table->text('details')->nullable();
            $table->unsignedBigInteger('team_id')->nullable();
            $table->unsignedBigInteger('board_id')->nullable();
            $table->unsignedBigInteger('task_id')->nullable();
            
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();

        });
    }

    public function down()
    {
        Schema::dropIfExists('logs');
    }
};
