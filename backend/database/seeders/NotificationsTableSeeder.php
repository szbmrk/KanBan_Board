<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class NotificationsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        for ($i = 0; $i < 50; $i++) {
            DB::table('notifications')->insert([
                'user_id' => rand(1, 10), 
                'type' => ['SYSTEM', 'TEAM', 'BOARD'][rand(0, 2)],
                'content' => Str::random(10),
                'is_read' => rand(0, 1) === 1, 
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
