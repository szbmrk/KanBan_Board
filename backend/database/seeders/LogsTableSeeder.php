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
                'user_id' => 10, 
                'action' => 'CREATED TEAM',
                'details' => '"Team Created successfully! -> teams of user 10"', 
                'task_id' => null, 
                'board_id' => null, 
                'team_id' => 5, 
                'created_at' => '2023-08-13 14:21:35',
            ],
            [
                'user_id' => 10, 
                'action' => 'CREATED BOARD', 
                'details' => '"Board created successfully!"', 
                'task_id' => null, 
                'board_id' => 8, 
                'team_id' => 5, 
                'created_at' => '2023-08-13 15:21:35',
            ],
            [
                'user_id' => 10, 
                'action' => 'CREATED COLUMN', 
                'details' => '"Column Created successfully!"', 
                'task_id' => null,
                'board_id' => 8, 
                'team_id' => 5, 
                'created_at' => '2023-08-13 16:21:35',
            ],
            [
                'user_id' => 10, 
                'action' => 'CREATED TASK', 
                'details' => '"created the first task of board 8"', 
                'task_id' => 11,
                'board_id' => 8, 
                'team_id' => 5, 
                'created_at' => '2023-08-13 17:21:35',
            ],
            [
                'user_id' => 10, 
                'action' => 'CREATED TASK', 
                'details' => '"created the second task of board 8"', 
                'task_id' => 12,
                'board_id' => 8, 
                'team_id' => 5, 
                'created_at' => '2023-08-14 11:21:35',
            ],
            [
                'user_id' => 10, 
                'action' => 'FINISHED TASK', 
                'details' => '"completed task"', 
                'task_id' => 12,
                'board_id' => 8, 
                'team_id' => 5, 
                'created_at' => '2023-08-14 17:21:35',
            ],
            [
                'user_id' => 10, 
                'action' => 'CREATED TASK', 
                'details' => '"created the second task of board 8"', 
                'task_id' => 13,
                'board_id' => 8, 
                'team_id' => 5, 
                'created_at' => '2023-08-15 17:21:35',
            ],
            [
                'user_id' => 10, 
                'action' => 'FINISHED TASK', 
                'details' => '"completed task"', 
                'task_id' => 13,
                'board_id' => 8, 
                'team_id' => 5, 
                'created_at' => '2023-08-20 17:21:35',
            ],
            [
                'user_id' => 10, 
                'action' => 'CREATED TASK', 
                'details' => '"created the second task of board 8"', 
                'task_id' => 14,
                'board_id' => 8, 
                'team_id' => 5, 
                'created_at' => '2023-08-21 10:21:35',
            ],
            [
                'user_id' => 10, 
                'action' => 'FINISHED TASK', 
                'details' => '"completed task"', 
                'task_id' => 14,
                'board_id' => 8, 
                'team_id' => 5, 
                'created_at' => '2023-08-21 13:21:35',
            ],
            [
                'user_id' => 10, 
                'action' => 'CREATED TASK', 
                'details' => '"created the second task of board 8"', 
                'task_id' => 15,
                'board_id' => 8, 
                'team_id' => 5, 
                'created_at' => '2023-08-21 17:21:35',
            ],
            [
                'user_id' => 10, 
                'action' => 'FINISHED TASK', 
                'details' => '"completed task"', 
                'task_id' => 15,
                'board_id' => 8, 
                'team_id' => 5, 
                'created_at' => '2023-08-23 17:21:35',
            ],

        ];

        DB::table('logs')->insert($logs);
    }
}
