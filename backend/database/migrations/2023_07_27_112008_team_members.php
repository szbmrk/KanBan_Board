<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('team_members', function (Blueprint $table) {
            $table->id('team_members_id');
            $table->unsignedBigInteger('team_id')->nullable(false);
            $table->unsignedBigInteger('user_id')->nullable(false);
            $table->timestamp('created_at')->useCurrent();
            $table->foreign('team_id')->references('team_id')->on('teams');
            $table->foreign('user_id')->references('user_id')->on('users');
        });
    }

    public function down()
    {
        Schema::dropIfExists('team_members');
    }
};