<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TasksTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

        $tasks = [
            [
                'title' => 'Make the frontend of the login page',
                'description' => 'Make the frontend in html and css to a simple login page with email and password fields',
                'due_date' => '2023-08-17',
                'board_id' => 1, 
                'column_id' => 1, 
                'project_id' => 1, 
                'priority_id' => 1, 
                'parent_task_id' => null,
                'completed' => false,
                'position' => 1.0, 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Task 2',
                'description' => 'Board 1 of Task 2',
                'due_date' => '2023-08-05', 
                'board_id' => 1, 
                'column_id' => 1, 
                'project_id' => 1,
                'priority_id' => 2, 
                'parent_task_id' => null,
                'completed' => false,
                'position' => 2.0, 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Task 3',
                'description' => 'Board 1 of Task 3',
                'due_date' => '2023-08-10', 
                'board_id' => 1, 
                'column_id' => 2, 
                'project_id' => 1,
                'priority_id' => 3, 
                'parent_task_id' => null,
                'completed' => false,
                'position' => 1.0, 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Task 4',
                'description' => 'Board 1 of Task 4',
                'due_date' => '2023-08-15', 
                'board_id' => 1, 
                'column_id' => 2, 
                'project_id' => 1,
                'priority_id' => 2, 
                'parent_task_id' => null,
                'completed' => false,
                'position' => 3.0, 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Task 5',
                'description' => 'Board 1 of Task 5',
                'due_date' => '2023-08-20', 
                'board_id' => 1, 
                'column_id' => 3, 
                'project_id' => 1,
                'priority_id' => 2, 
                'parent_task_id' => null,
                'completed' => false,
                'position' => 1.0, 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Task 6',
                'description' => 'Board 1 of Task 6',
                'due_date' => '2023-08-25', 
                'board_id' => 1, 
                'column_id' => 3, 
                'project_id' => 1,
                'priority_id' => 4, 
                'parent_task_id' => null,
                'completed' => false,
                'position' => 2.0, 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Task 1',
                'description' => 'Board 2 of Task 1',
                'due_date' => '2023-08-30', 
                'board_id' => 2, 
                'column_id' => 4, 
                'project_id' => 2,
                'priority_id' => 1, 
                'parent_task_id' => null,
                'completed' => true,
                'position' => 1.0, 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Task 2',
                'description' => 'Board 2 of Task 2',
                'due_date' => '2023-09-05', 
                'board_id' => 2, 
                'column_id' => 4, 
                'project_id' => 2,
                'priority_id' => 3, 
                'parent_task_id' => null,
                'completed' => true,
                'position' => 2.0, 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Task 3',
                'description' => 'Board 2 of Task 3',
                'due_date' => '2023-09-10', 
                'board_id' => 2, 
                'column_id' => 4, 
                'project_id' => 1,
                'priority_id' => 2, 
                'parent_task_id' => null,
                'completed' => true,
                'position' => 3.0, 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Task 4',
                'description' => 'Board 2 of Task 4',
                'due_date' => '2023-09-15', 
                'board_id' => 2, 
                'column_id' => 5, 
                'project_id' => 1,
                'priority_id' => 1, 
                'parent_task_id' => null,
                'completed' => true,
                'position' => 1.0, 
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];


        DB::table('tasks')->insert($tasks);
    }
}
