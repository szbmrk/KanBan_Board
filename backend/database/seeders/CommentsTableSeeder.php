<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CommentsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Seed the 'comments' table with sample data
        $comments = [
            [
                'task_id' => 1, 
                'user_id' => 1, 
                'text' => 'This is the first comment for Task 1.', 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'task_id' => 1, 
                'user_id' => 2, 
                'text' => 'This is another comment for Task 1.', 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'task_id' => 2, 
                'user_id' => 1, 
                'text' => 'This is a comment for Task 2.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'task_id' => 3, 
                'user_id' => 3, 
                'text' => 'This is the first comment for Task 3.', 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'task_id' => 4, 
                'user_id' => 5, 
                'text' => 'This is another comment for Task 4.', 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'task_id' => 5, 
                'user_id' => 7, 
                'text' => 'This is a comment for Task 5.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'task_id' => 6, 
                'user_id' => 6, 
                'text' => 'This is the first comment for Task 6.', 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'task_id' => 7, 
                'user_id' => 3, 
                'text' => 'This is another comment for Task 7.', 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'task_id' => 8, 
                'user_id' => 8, 
                'text' => 'This is a comment for Task 8.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'task_id' => 9, 
                'user_id' => 10, 
                'text' => 'This is another comment for Task 9.', 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'task_id' => 10, 
                'user_id' => 9, 
                'text' => 'This is a comment for Task 10.',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            
        ];

        // Insert the comments into the 'comments' table
        DB::table('comments')->insert($comments);
    }
}
