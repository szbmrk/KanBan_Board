<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Array of roles to be inserted into the 'roles' table
        $roles = [
            ['name' => 'User', 'board_id' => 1, 'created_at' => now(),'updated_at' => now()],
            ['name' => 'System Admin', 'board_id' => 1, 'created_at' => now(),'updated_at' => now()],
            ['name' => 'Project Manager', 'board_id' => 1,'created_at' => now(),'updated_at' => now()],
        ];

        // Insert the roles into the 'roles' table
        DB::table('roles')->insert($roles);
    }
}
