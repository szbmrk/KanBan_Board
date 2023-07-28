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
            ],
            [
                'tag_id' => 2, 
                'task_id' => 1, 
            ],
            [
                'tag_id' => 1, 
                'task_id' => 2, 
            ],
            [
                'tag_id' => 3, 
                'task_id' => 3, 
            ],
            [
                'tag_id' => 1, 
                'task_id' => 4, 
            ],
            [
                'tag_id' => 1, 
                'task_id' => 5, 
            ],
            [
                'tag_id' => 1, 
                'task_id' => 6, 
            ],
            [
                'tag_id' => 2, 
                'task_id' => 7, 
            ],
            [
                'tag_id' => 1, 
                'task_id' => 8, 
            ],
            [
                'tag_id' => 1, 
                'task_id' => 3, 
            ],
            [
                'tag_id' => 2, 
                'task_id' => 4, 
            ],
            [
                'tag_id' => 3, 
                'task_id' => 4, 
            ],


        ];

        // Insert the task-tag associations into the 'task_tags' table
        DB::table('task_tags')->insert($taskTags);
    }
}
