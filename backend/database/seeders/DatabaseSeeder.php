<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\User;
use Illuminate\Database\Seeder;

use Database\Factories\UserFactory;
use Database\Seeders\LogsTableSeeder;
use Database\Seeders\TagsTableSeeder;
use Database\Seeders\UserTableSeeder;
use Database\Seeders\RolesTableSeeder;
use Database\Seeders\TasksTableSeeder;
use Database\Seeders\TeamsTableSeeder;
use Database\Seeders\BoardsTableSeeder;
use Database\Seeders\ColumnsTableSeeder;
use Database\Seeders\CommentsTableSeeder;
use Database\Seeders\MentionsTableSeeder;
use Database\Seeders\TaskTagsTableSeeder;
use Database\Seeders\FeedbacksTableSeeder;
use Database\Seeders\UserTasksTableSeeder;
use Database\Seeders\PrioritiesTableSeeder;
use Database\Seeders\AttachmentsTableSeeder;
use Database\Seeders\TeamMembersTableSeeder;
use Database\Seeders\NotificationsTableSeeder;
use Database\Seeders\FavouriteTasksTableSeeder;
use Database\Seeders\TeamMembersRoleTableSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        // Create 10 users (every time they are different!)
        #UserFactory::new()->count(10)->create();

        // Calling the other seeders
        //Every time they are the same!
        $this->call([ 
            UserTableSeeder::class,
            RolesTableSeeder::class,
            TeamsTableSeeder::class,
            TeamMembersTableSeeder::class,
            BoardsTableSeeder::class,
            ColumnsTableSeeder::class,
            PrioritiesTableSeeder::class,
            TagsTableSeeder::class,
            TasksTableSeeder::class,
            TaskTagsTableSeeder::class,
            CommentsTableSeeder::class,
            UserTasksTableSeeder::class,
            MentionsTableSeeder::class,
            FeedbacksTableSeeder::class,
            NotificationsTableSeeder::class,
            TeamMembersRoleTableSeeder::class,
            FavouriteTasksTableSeeder::class,
            AttachmentsTableSeeder::class,
            LogsTableSeeder::class,
           
            
        ]);
    }
}
