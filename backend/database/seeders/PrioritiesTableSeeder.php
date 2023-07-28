<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PrioritiesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

        $priorities = [
            ['priority' => 'TOP PRIORITY'],
            ['priority' => 'HIGH PRIORITY'],
            ['priority' => 'MEDIUM PRIORITY'],
            ['priority' => 'LOW PRIORITY'],
        ];

        DB::table('priorities')->insert($priorities);
    }
}
