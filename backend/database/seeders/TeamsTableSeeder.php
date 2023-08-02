<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TeamsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Seed the 'teams' table with sample data
        $teams = [
            [
                'name' => 'Team 1',
                'created_by' => 1, 
                'parent_team_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Team 2',
                'created_by' => 2, 
                'parent_team_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Team 3 (Subteam of Team 1)',
                'created_by' => 3, 
                'parent_team_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Team 4 (Empty)',
                'created_by' => 10, 
                'parent_team_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]


        ];


        DB::table('teams')->insert($teams);
    }
}
