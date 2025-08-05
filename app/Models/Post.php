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
}
