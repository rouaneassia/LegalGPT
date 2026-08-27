<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Embedding extends Model
{
    protected $fillable = [
        'knowledge_chunk_id', 
        'embedding', // زيد أي حقول أخرى عندك في جدول embeddings كايتحفظوا بروغراماتيكياً
    ];

    public function knowledge()
    {
        return $this->belongsTo(Knowledge::class);
    }
}