<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermissionsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = 
        [
            [
                'name' => 'team_members_role_system_admin',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'team_members_role_board_manager',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'team_members_create_role_on_board',
                'created_at' => now(),
                'updated_at' => now()
            ],
            ];

            DB::table('permissions')->insert($permissions);


            
    }
}
