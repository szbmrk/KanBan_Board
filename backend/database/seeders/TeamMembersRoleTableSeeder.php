<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TeamMembersRoleTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $team_member_roles = [];
    
        // 1-5 csapattag "User" szerepkörrel
        for ($i = 1; $i <= 5; $i++) {
            $team_member_roles[] = ['team_member_id' => $i, 'role_id' => 1];
        }
    
        // 6-8 csapattag "System Admin" szerepkörrel
        for ($i = 6; $i <= 8; $i++) {
            $team_member_roles[] = ['team_member_id' => $i, 'role_id' => 2];
        }
    
        // 9-10 csapattag "Board Manager" szerepkörrel
        for ($i = 9; $i <= 10; $i++) {
            $team_member_roles[] = ['team_member_id' => $i, 'role_id' => 3];
        }
    
        DB::table('team_members_role')->insert($team_member_roles);
    }
    
}
