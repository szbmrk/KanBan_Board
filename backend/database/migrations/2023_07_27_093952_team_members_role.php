<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('team_members_role', function (Blueprint $table) {
            $table->id('team_members_role_id');
            $table->unsignedBigInteger('team_member_id')->nullable(false);
            $table->unsignedBigInteger('role_id')->nullable(false);
        });
    }

    public function down()
    {
        Schema::dropIfExists('team_members_role');
    }
};
