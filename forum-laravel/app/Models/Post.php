<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{

    protected $fillable = [
        'title',
        'category_id',
        'sub_category_id',
        'details',
        'tag',
        'student_id',
        'status',
        'file',
        'post_img',
        'ex1',
        'ex2',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function subCategory()
    {
        return $this->belongsTo(SubCategory::class, 'sub_category_id');
    }

    public function student()
    {
        return $this->belongsTo(UserEntry::class, 'student_id');
    }
    public function votes()
    {
        return $this->hasMany(Vote::class);
    }

    public function upvotes()
    {
        return $this->votes()->where('vote', 'upvote');
    }

    public function downvotes()
    {
        return $this->votes()->where('vote', 'downvote');
    }
    // post views
    public function views()
    {
        return $this->hasMany(PostView::class);
    }

    public function viewCount()
    {
        return $this->views()->count();
    }
    // comments
    public function comments()
    {
        return $this->hasMany(Comment::class)->where('status', 1);
    }
}
