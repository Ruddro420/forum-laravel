<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('chat.{userOneId}.{userTwoId}', function ($user, $userOneId, $userTwoId) {
    return $user->id == $userOneId || $user->id == $userTwoId;
});