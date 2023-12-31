<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ColumnsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

        $columns = [
            [
                'name' => 'To Do',
                'position' => 0,
                'board_id' => 1, 
                'is_finished' => false,
                'task_limit' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'In Progress',
                'position' => 1,
                'board_id' => 1,
                'is_finished' => false,
                'task_limit' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Done',
                'position' => 2,
                'board_id' => 1,
                'is_finished' => true,
                'task_limit' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'To Do',
                'position' => 0,
                'board_id' => 2, 
                'is_finished' => false,
                'task_limit' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'In Progress',
                'position' => 1,
                'board_id' => 2,
                'is_finished' => false,
                'task_limit' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Done',
                'position' => 2,
                'board_id' => 2,
                'is_finished' => true,
                'task_limit' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'To Do',
                'position' => 0,
                'board_id' => 3, 
                'is_finished' => false,
                'task_limit' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'In Progress',
                'position' => 1,
                'board_id' => 3,
                'is_finished' => false,
                'task_limit' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Done',
                'position' => 2,
                'board_id' => 3,
                'is_finished' => true,
                'task_limit' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'To Do',
                'position' => 0,
                'board_id' => 4, 
                'is_finished' => false,
                'task_limit' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'In Progress',
                'position' => 1,
                'board_id' => 4,
                'is_finished' => false,
                'task_limit' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Done',
                'position' => 2,
                'board_id' => 4,
                'is_finished' => true,
                'task_limit' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'To Do',
                'position' => 0,
                'board_id' => 5, 
                'is_finished' => false,
                'task_limit' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'In Progress',
                'position' => 1,
                'board_id' => 5,
                'is_finished' => false,
                'task_limit' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Done',
                'position' => 1,
                'board_id' => 5,
                'is_finished' => true,
                'task_limit' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'To Do',
                'position' => 0,
                'board_id' => 6, 
                'is_finished' => false,
                'task_limit' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'In Progress',
                'position' => 1,
                'board_id' => 6,
                'is_finished' => false,
                'task_limit' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Done',
                'position' => 2,
                'board_id' => 6,
                'is_finished' => true,
                'task_limit' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'column1 of board id 8',
                'position' => 0,
                'board_id' => 8,
                'is_finished' => false,
                'task_limit' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],

        ];


        DB::table('columns')->insert($columns);
    }
}
