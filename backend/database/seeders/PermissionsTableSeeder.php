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
                'name' => 'system_admin',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'user_permission',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'team_management',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'team_member_management',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'board_management',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'role_management',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'team_members_role_management',
                'created_at' => now(),
                'updated_at' => now()
            ],
            ];

            DB::table('permissions')->insert($permissions);
    }
}
