<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AttachmentsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

        $attachments = [
            [
                'link' => 'https://example.com/attachment1.pdf', 
                'description' => 'This is the first attachment for Task 1.', 
                'task_id' => 1, 
            ],
            [
                'link' => 'https://example.com/attachment2.jpg',
                'description' => 'This is another attachment for Task 1.', 
                'task_id' => 1, 
            ],
            [
                'link' => 'https://example.com/attachment3.docx', 
                'description' => 'This is an attachment for Task 2.', 
                'task_id' => 2,
            ],
            [
                'link' => 'https://example.com/attachment1.pdf', 
                'description' => 'This is the first attachment for Task 3.', 
                'task_id' => 3, 
            ],
            [
                'link' => 'https://example.com/attachment2.jpg',
                'description' => 'This is another attachment for Task 3.', 
                'task_id' => 3, 
            ],
            [
                'link' => 'https://example.com/attachment1.docx', 
                'description' => 'This is an attachment for Task 4.', 
                'task_id' => 4,
            ],
            [
                'link' => 'https://example.com/attachment1.pdf', 
                'description' => 'This is the first attachment for Task 5.', 
                'task_id' => 5, 
            ],
            [
                'link' => 'https://example.com/attachment2.jpg',
                'description' => 'This is another attachment for Task 5.', 
                'task_id' => 5, 
            ],
            [
                'link' => 'https://example.com/attachment1.docx', 
                'description' => 'This is an attachment for Task 6.', 
                'task_id' => 6,
            ],

         
            
        ];


        DB::table('attachments')->insert($attachments);
    }
}
