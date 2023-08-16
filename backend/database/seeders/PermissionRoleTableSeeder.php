<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermissionRoleTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permission_role = [
            [
                'permission_id' => 1,
                'role_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'permission_id' => 2,
                'role_id' => 2,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'permission_id' => 3,
                'role_id' => 3,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'permission_id' => 4,
                'role_id' => 3,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'permission_id' => 5,
                'role_id' => 4,
                'created_at' => now(),
                'updated_at' => now()
            ],
            
        ];
        DB::table('permission_role')->insert($permission_role);
    }
}
