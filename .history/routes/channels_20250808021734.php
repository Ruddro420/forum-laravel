<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('chat.{userOneId}.{userTwoId}', function ($user, $userOneId, $userTwoId) {
    // Allow user if they are one of the two chat participants
    return $user->id == $userOneId || $user->id == $userTwoId;
});
