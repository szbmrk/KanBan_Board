<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\User;
use Illuminate\Database\Seeder;

use Database\Factories\UserFactory;
use Database\Seeders\RolesTableSeeder;
use Database\Seeders\TeamsTableSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        // Create 5 users
        UserFactory::new()->count(5)->create();

        $this->call([
            RolesTableSeeder::class,
            TeamsTableSeeder::class
        ]);
    }
}
