<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TagsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

        $tags = [
            ['name' => 'Tag 1', 'color' => '#BB0000', 'board_id' => '1'],
            ['name' => 'Tag 2', 'color' => '#008000', 'board_id' => '1'],
            ['name' => 'Tag 3', 'color' => '#008000', 'board_id' => '1'],
            ['name' => 'Tag 4', 'color' => '#0000BB', 'board_id' => '2'],
            ['name' => 'Tag 5', 'color' => '#0000BB', 'board_id' => '2'],
            ['name' => 'Tag 6', 'color' => '#BB0000', 'board_id' => '3'],
            ['name' => 'Tag 7', 'color' => '#0000BB', 'board_id' => '3'],
            ['name' => 'Frontend', 'color' => '#BB0000', 'board_id' => '1'],
            ['name' => 'Backend', 'color' => '#008000', 'board_id' => '2'],
            ['name' => 'Test', 'color' => '#0000BB', 'board_id' => '3'],
        ];

        DB::table('tags')->insert($tags);
    }
}
