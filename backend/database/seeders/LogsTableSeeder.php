<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LogsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

        $logs = [
            [
                'user_id' => 1, 
                'action' => 'CREATED TEAM',
                'details' => 'Team "Development" was created.', 
                'task_id' => null, 
                'board_id' => null, 
                'team_id' => null, 
                'created_at' => now(),
            ],
            [
                'user_id' => 2, 
                'action' => 'UPDATED TASK', 
                'details' => 'Task "Fix bugs" status was changed to "In Progress".', 
                'task_id' => 1, 
                'board_id' => 1, 
                'team_id' => null, 
                'created_at' => now(),
            ],
            [
                'user_id' => 1, 
                'action' => 'COMMENTED ON TASK', 
                'details' => 'Left a comment on Task "Bug #123".', 
                'task_id' => 1,
                'board_id' => 1, 
                'team_id' => 1, 
                'created_at' => now(),
            ],

        ];

        DB::table('logs')->insert($logs);
    }
}
