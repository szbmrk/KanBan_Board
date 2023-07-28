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
            ['name' => 'User'],
            ['name' => 'System Admin'],
            ['name' => 'Project Manager'],
        ];

        // Insert the roles into the 'roles' table
        DB::table('roles')->insert($roles);
    }
}
