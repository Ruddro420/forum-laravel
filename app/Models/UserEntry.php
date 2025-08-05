<?php

namespace App\Models;
use Illuminate\Support\Facades\Hash;

use Illuminate\Database\Eloquent\Model;

class UserEntry extends Model
{
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'category_id',
        'sub_category_id',
        'institute_type',
        'password',
        'status',
    ];

    public function setPasswordAttribute($value)
    {
        $this->attributes['password'] = Hash::make($value);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function subCategory()
    {
        return $this->belongsTo(SubCategory::class);
    }
}
