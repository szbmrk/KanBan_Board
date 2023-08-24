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
                'board_id' => '1'
            ],
            [
                'act_as_a' => 'Backend developer',
                'board_id' => '1'

            ],
            [
                'act_as_a' => 'Code reviewer',
                'board_id' => '2'

            ],
            // Add more sample data as needed
        ];

        DB::table('agi_behaviors')->insert($data);
    }
}
