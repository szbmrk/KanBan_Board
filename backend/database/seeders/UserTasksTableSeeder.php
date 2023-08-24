<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserTasksTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

        $userTasks = [
            [
                'user_id' => 1, 
                'task_id' => 1, 
            ],
            [
                'user_id' => 2, 
                'task_id' => 2, 
            ],
            [
                'user_id' => 3,
                'task_id' => 3, 
            ],
            [
                'user_id' => 4, 
                'task_id' => 4, 
            ],
            [
                'user_id' => 5, 
                'task_id' => 5, 
            ],
            [
                'user_id' => 1, 
                'task_id' => 7, 
            ],
            [
                'user_id' => 1, 
                'task_id' => 6, 
            ],
            [
                'user_id' => 10, 
                'task_id' => 11, 
            ],
            [
                'user_id' => 10, 
                'task_id' => 12, 
            ],
            


        ];

        DB::table('user_tasks')->insert($userTasks);
    }
}
