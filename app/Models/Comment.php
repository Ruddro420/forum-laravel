<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    protected $fillable = [
        'post_id',
        'user_id',
        'comment',
        'role',
        'status',
        'file',
        'ex1',
        'ex2',
    ];

    /**
     * Get the post that this comment belongs to.
     */
    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Get the user (student or admin) who made the comment.
     */
    public function user()
    {
        return $this->belongsTo(UserEntry::class);
    }
}
