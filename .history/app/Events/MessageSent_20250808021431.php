<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class MessageSent implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $message;

    public function __construct(Message $message)
    {
        $this->message = $message;
    }

    // Private channel for chatting between two users (unique per pair)
    public function broadcastOn()
    {
        $sender = $this->message->sender_id;
        $receiver = $this->message->receiver_id;

        // Channel name e.g. private-chat.1.2 or private-chat.2.1 (order consistently)
        $ids = [$sender, $receiver];
        sort($ids);
        return new PrivateChannel('chat.' . $ids[0] . '.' . $ids[1]);
    }

    public function broadcastWith()
    {
        return ['message' => $this->message];
    }
}
