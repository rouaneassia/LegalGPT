<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KnowledgeChunk extends Model
{protected $fillable = [
    'source_id',
    'chunk_index',
    'page',
    'article',
    'content',
    'characters',
    'metadata',
];
    protected $casts = [
        'metadata' => 'array',
    ];

    public function source()
    {
        return $this->belongsTo(Source::class);
    }
}