<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Favorite extends Model
{
    public function user()
{
    return $this->belongsTo(User::class);
}

public function document()
{
    return $this->belongsTo(
        GeneratedDocument::class,
        'generated_document_id'
    );
}
}
