<?php
namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FavouriteBoardsChange
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $changeType;
    public $board;

    /**
     * Create a new event instance.
     */
    public function __construct($changeType, $board)
    {
        $this->changeType = $changeType;
        $this->board = $board;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            'FavouriteBoardsChange',
        ];
    }

    /**
     * Get the broadcast event name.
     *
     * @return string
     */
    public function broadcastAs()
    {
        return 'favouriteBoards.' . $this->board;
    }
}
