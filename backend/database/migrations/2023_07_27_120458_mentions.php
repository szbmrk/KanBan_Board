<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('mentions', function (Blueprint $table) {
            $table->id('mention_id');
            $table->unsignedBigInteger('user_id')->nullable(false);
            $table->unsignedBigInteger('comment_id')->nullable(false);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();

            $table->foreign('user_id')->references('user_id')->on('users');
            $table->foreign('comment_id')->references('comment_id')->on('comments');
        });
    }

    public function down()
    {
        Schema::dropIfExists('mentions');
    }
};
