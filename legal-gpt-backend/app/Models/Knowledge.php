<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Knowledge extends Model
{
    public function category()
{
    return $this->belongsTo(Category::class);
}

public function embedding()
{
    return $this->hasOne(Embedding::class);
}
}
