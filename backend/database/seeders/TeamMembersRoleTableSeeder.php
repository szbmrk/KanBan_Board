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
        $team_member_roles = [
            ['team_member_id' => 1, 'role_id' => 1],
            ['team_member_id' => 1, 'role_id' => 2],
            ['team_member_id' => 2, 'role_id' => 3],
        ];
        
        DB::table('team_members_role')->insert($team_member_roles);
    }
    
    
}
