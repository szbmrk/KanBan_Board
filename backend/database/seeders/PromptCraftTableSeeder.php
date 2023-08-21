<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
class PromptCraftTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            [
                'crafted_prompt_title' => 'Frontend: Login page',
                'board_id' => 1,
                'agi_behavior_id' => 1,
                'crafted_prompt_text' => 'Generate a frontend login page in React.',
                'craft_with' => 'CHATGPT',
                'action' => 'GENERATETASK',
                'created_by' => 1,
            ],
            [
                'crafted_prompt_title' => 'Backend: Login page',
                'board_id' => 1,
                'agi_behavior_id' => 2,
                'crafted_prompt_text' => 'Generate a backend login page in Laravel.',
                'craft_with' => 'CHATGPT',
                'action' => 'GENERATETASK',
                'created_by' => 1,
            ],
            // Add more sample data as needed
        ];

        DB::table('crafted_prompts')->insert($data);
    }
}
