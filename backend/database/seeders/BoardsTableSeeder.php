<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BoardsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

        $boards = [
            [
                'name' => 'Team1_Board1',
                'team_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Team1_Board2',
                'team_id' => 1, 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Team1_Board3',
                'team_id' => 1, 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Team2_Board1',
                'team_id' => 2, 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Team2_Board2',
                'team_id' => 2, 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Team3_Board1',
                'team_id' => 3, 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Team4_Board1',
                'team_id' => 4, 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Board of user 10',
                'team_id' => 5, 
                'created_at' => now(),
                'updated_at' => now(),
            ],

        ];


        DB::table('boards')->insert($boards);
    }
}
