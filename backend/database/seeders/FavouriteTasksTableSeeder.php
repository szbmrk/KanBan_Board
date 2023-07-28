<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FavouriteTasksTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

        $favouriteTasks = [
            [
                'user_id' => 1, 
                'task_id' => 1, 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 2, 
                'task_id' => 2, 
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 3, 
                'task_id' => 3, 
                'created_at' => now(),
                'updated_at' => now(),
            ],

        ];

        DB::table('favourite_tasks')->insert($favouriteTasks);
    }
}
