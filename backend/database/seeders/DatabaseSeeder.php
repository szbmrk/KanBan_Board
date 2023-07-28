<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\User;
use Illuminate\Database\Seeder;

use Database\Factories\UserFactory;
use Database\Seeders\RolesTableSeeder;
use Database\Seeders\TeamsTableSeeder;
use Database\Seeders\NotificationsTableSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        // Create 10 users
        UserFactory::new()->count(10)->create();

        // Calling the other seeders
        $this->call([
            RolesTableSeeder::class,
            TeamsTableSeeder::class,
            TeamMembersTableSeeder::class,
            BoardsTableSeeder::class,
            ColumnsTableSeeder::class,
            PrioritiesTableSeeder::class,
            TagsTableSeeder::class,
            NotificationsTableSeeder::class,
        ]);
    }
}
