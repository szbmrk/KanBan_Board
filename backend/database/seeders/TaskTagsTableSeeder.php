<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TaskTagsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

        $taskTags = [
            [
                'tag_id' => 1, 
                'task_id' => 1,
                'board_id' => 1 
            ],
            [
                'tag_id' => 2, 
                'task_id' => 1, 
                'board_id' => 2
            ],
            [
                'tag_id' => 1, 
                'task_id' => 2, 
                'board_id' => 1
            ],
            [
                'tag_id' => 3, 
                'task_id' => 3,
                'board_id' => 2 
            ],
            [
                'tag_id' => 1, 
                'task_id' => 4, 
                'board_id' => 1
            ],
            [
                'tag_id' => 1, 
                'task_id' => 5, 
                'board_id' => 2
            ],
            [
                'tag_id' => 1, 
                'task_id' => 6, 
                'board_id' => 2
            ],
            [
                'tag_id' => 2, 
                'task_id' => 7,
                'board_id' => 2 
            ],
            [
                'tag_id' => 1, 
                'task_id' => 8,
                'board_id' => 1
            ],
            [
                'tag_id' => 1, 
                'task_id' => 3,
                'board_id' => 1 
            ],
            [
                'tag_id' => 2, 
                'task_id' => 4,
                'board_id' => 2 
            ],
            [
                'tag_id' => 3, 
                'task_id' => 4,
                'board_id' => 2 
            ],


        ];

        // Insert the task-tag associations into the 'task_tags' table
        DB::table('task_tags')->insert($taskTags);
    }
}
