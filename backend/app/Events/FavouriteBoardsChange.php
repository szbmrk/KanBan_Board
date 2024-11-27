<?php
namespace App\Events;

use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;


class FavouriteBoardsChange implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $changeType;
    public $data;
    public $userId;

    public function __construct($changeType, $userId, $data)
    {
        $this->changeType = $changeType;
        $this->userId = $userId;
        $this->data = $data;
    }

    public function broadcastOn(): array
    {
        return ['FavouriteBoardsChange'];
    }

    public function broadcastAs()
    {
        return 'favouriteBoards.' . $this->userId;
    }
}
