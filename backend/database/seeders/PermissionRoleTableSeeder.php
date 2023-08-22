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
        ];
        DB::table('permission_role')->insert($permission_role);
    }
}
