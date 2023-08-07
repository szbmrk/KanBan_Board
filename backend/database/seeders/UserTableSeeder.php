<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        // Seed the 'teams' table with sample data
        $users = [
            [
                'username' => 'user1',
                'email' => 'user1@gmail.com', 
                'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'username' => 'user2',
                'email' => 'user2@gmail.com', 
                'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'username' => 'user3',
                'email' => 'user3@gmail.com', 
                'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'username' => 'user4',
                'email' => 'user4@gmail.com', 
                'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'username' => 'user5',
                'email' => 'user5@gmail.com', 
                'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'username' => 'user6',
                'email' => 'user6@gmail.com', 
                'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'username' => 'user7',
                'email' => 'user7@gmail.com', 
                'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'username' => 'user8',
                'email' => 'user8@gmail.com', 
                'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'username' => 'user9',
                'email' => 'user9@gmail.com', 
                'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'username' => 'user10',
                'email' => 'user10@gmail.com', 
                'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
                'created_at' => now(),
                'updated_at' => now(),
            ],


        ];


        DB::table('users')->insert($users);
    }
}
