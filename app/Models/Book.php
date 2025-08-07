<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    protected $fillable = [
        'name',
        'category_id',
        'sub_category_id',
        'description',
        'price',
        'book_file',
        'cover_image',
        'status',
    ];

    // Category relationship
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // Subcategory relationship
    public function subCategory()
    {
        return $this->belongsTo(SubCategory::class, 'sub_category_id');
    }
}
