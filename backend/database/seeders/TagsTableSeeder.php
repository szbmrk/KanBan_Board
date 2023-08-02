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
            ['name' => 'Tag 1', 'color' => '#FF0000', 'board_id' => '1'],
            ['name' => 'Tag 2', 'color' => '#00FF00', 'board_id' => '2'],
            ['name' => 'Tag 3', 'color' => '#0000FF', 'board_id' => '3'], 

        ];

        DB::table('tags')->insert($tags);
    }
}
