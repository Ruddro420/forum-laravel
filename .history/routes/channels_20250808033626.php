<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('chat.{userOneId}.{userTwoId}', function ($user, $userOneId, $userTwoId) {
    // No auth check, allow all (or remove $user parameter if you want)
    return true;
});