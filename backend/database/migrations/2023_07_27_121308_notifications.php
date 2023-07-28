<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id('notification_id');
            $table->unsignedBigInteger('user_id')->nullable(false);
            $table->enum('type', ['SYSTEM', 'TEAM', 'BOARD'])->nullable(false);
            $table->text('content')->nullable(false);
            $table->boolean('is_read')->default(false);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();

            $table->foreign('user_id')->references('user_id')->on('users');
        });
    }

    public function down()
    {
        Schema::dropIfExists('notifications');
    }
};
