<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MentionsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

        $mentions = [
            [
                'user_id' => 1, 
                'comment_id' => 1, 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 2, 
                'comment_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 4, 
                'comment_id' => 5, 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 1, 
                'comment_id' => 6, 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 3, 
                'comment_id' => 7,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 9, 
                'comment_id' => 9, 
                'created_at' => now(),
                'updated_at' => now(),
            ],

        ];


        DB::table('mentions')->insert($mentions);
    }
}
