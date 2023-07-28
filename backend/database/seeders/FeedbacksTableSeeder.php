<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FeedbacksTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

        $feedbacks = [
            [
                'task_id' => 5, 
                'user_id' => 1,
                'difficulty_level' => 'MEDIUM', 
                'user_rating' => '4', 
                'text' => 'This task was challenging but achievable.', 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'task_id' => 6, 
                'user_id' => 2, 
                'difficulty_level' => 'EASY', 
                'user_rating' => '5', 
                'text' => 'This task was straightforward and enjoyable.', 
                'created_at' => now(),
                'updated_at' => now(),
            ],

        ];


        DB::table('feedbacks')->insert($feedbacks);
    }
}
