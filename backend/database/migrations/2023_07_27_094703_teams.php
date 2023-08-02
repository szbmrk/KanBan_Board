<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('teams', function (Blueprint $table) {
            $table->id('team_id');
            $table->string('name', 255)->nullable(false);
            $table->unsignedBigInteger('parent_team_id')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();

            $table->foreign('created_by')->references('user_id')->on('users')->onDelete('cascade');
            $table->foreign('parent_team_id')->references('team_id')->on('teams')->onDelete('cascade');

        });
    }

    public function down()
    {
        Schema::dropIfExists('teams');
    }
};
