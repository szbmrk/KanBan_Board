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
                'title' => 'Task 1',
                'description' => 'Description of Task 1',
                'due_date' => '2023-07-31', 
                'column_id' => 1, 
                'project_id' => 1, 
                'priority_id' => 1, 
                'parent_task_id' => null,
                'position' => 1.0, 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Task 2',
                'description' => 'Description of Task 2',
                'due_date' => '2023-08-05', 
                'column_id' => 1, 
                'project_id' => 1,
                'priority_id' => 2, 
                'parent_task_id' => null,
                'position' => 2.0, 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Task 3',
                'description' => 'Description of Task 3',
                'due_date' => '2023-08-10', 
                'column_id' => 2, 
                'project_id' => 1,
                'priority_id' => 3, 
                'parent_task_id' => null,
                'position' => 1.0, 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Task 4',
                'description' => 'Description of Task 4',
                'due_date' => '2023-08-15', 
                'column_id' => 1, 
                'project_id' => 1,
                'priority_id' => 2, 
                'parent_task_id' => null,
                'position' => 3.0, 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Task 5',
                'description' => 'Description of Task 5',
                'due_date' => '2023-08-20', 
                'column_id' => 3, 
                'project_id' => 1,
                'priority_id' => 2, 
                'parent_task_id' => null,
                'position' => 1.0, 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Task 6',
                'description' => 'Description of Task 6',
                'due_date' => '2023-08-25', 
                'column_id' => 3, 
                'project_id' => 1,
                'priority_id' => 4, 
                'parent_task_id' => null,
                'position' => 2.0, 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Task 7',
                'description' => 'Description of Task 7',
                'due_date' => '2023-08-30', 
                'column_id' => 4, 
                'project_id' => 2,
                'priority_id' => 1, 
                'parent_task_id' => null,
                'position' => 1.0, 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Task 8',
                'description' => 'Description of Task 8',
                'due_date' => '2023-09-05', 
                'column_id' => 4, 
                'project_id' => 2,
                'priority_id' => 3, 
                'parent_task_id' => null,
                'position' => 2.0, 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Task 9',
                'description' => 'Description of Task 9',
                'due_date' => '2023-09-10', 
                'column_id' => 4, 
                'project_id' => 1,
                'priority_id' => 2, 
                'parent_task_id' => null,
                'position' => 3.0, 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Task 10',
                'description' => 'Description of Task 10',
                'due_date' => '2023-09-15', 
                'column_id' => 5, 
                'project_id' => 1,
                'priority_id' => 1, 
                'parent_task_id' => null,
                'position' => 1.0, 
                'created_at' => now(),
                'updated_at' => now(),
            ],



        ];


        DB::table('tasks')->insert($tasks);
    }
}
