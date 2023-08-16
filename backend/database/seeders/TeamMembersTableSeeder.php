<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TeamMembersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Seed the 'team_members' table with sample data
        $teamMembers = [
            [
                'team_id' => 1, 
                'user_id' => 1, 
                'created_at' => now(),
            ],
            [
                'team_id' => 1,
                'user_id' => 2, 
                'created_at' => now(),
            ],
            [
                'team_id' => 1,
                'user_id' => 3, 
                'created_at' => now(),
            ],
            [
                'team_id' => 2,
                'user_id' => 1, 
                'created_at' => now(),
            ],
            [
                'team_id' => 2,
                'user_id' => 2, 
                'created_at' => now(),
            ],
            [
                'team_id' => 2,
                'user_id' => 6, 
                'created_at' => now(),
            ],
            [
                'team_id' => 2,
                'user_id' => 7, 
                'created_at' => now(),
            ],
            [
                'team_id' => 2,
                'user_id' => 8, 
                'created_at' => now(),
            ],
            [
                'team_id' => 3,
                'user_id' => 1, 
                'created_at' => now(),
            ],
            [
                'team_id' => 3,
                'user_id' => 3, 
                'created_at' => now(),
            ],
            [
                'team_id' => 4,
                'user_id' => 10, 
                'created_at' => now(),
            ],
            [
                'team_id' => 4,
                'user_id' => 9, 
                'created_at' => now(),
            ],
            

        ];

        DB::table('team_members')->insert($teamMembers);
    }
}
