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
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();

            // Add the onDelete('cascade') option to both foreign key definitions
            $table->foreign('team_member_id')->references('user_id')->on('team_members')->onDelete('cascade');
            $table->foreign('role_id')->references('role_id')->on('roles')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('team_members_role');
    }
};
