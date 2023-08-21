<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AgiBehaviorTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            [
                'act_as_a' => 'Frontend developer',
            ],
            [
                'act_as_a' => 'Backend developer',
            ],
            // Add more sample data as needed
        ];

        DB::table('agi_behavior')->insert($data);
    }
}
