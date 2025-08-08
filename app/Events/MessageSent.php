<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use SerializesModels;

    public $message;

    public function __construct(Message $message)
    {
        $this->message = $message;
    }

    public function broadcastOn()
    {
        $ids = [$this->message->sender_id, $this->message->receiver_id];
        sort($ids);

        return new PrivateChannel('chat.' . $ids[0] . '.' . $ids[1]);
    }

    public function broadcastWith()
    {
        return ['message' => $this->message];
    }
}
