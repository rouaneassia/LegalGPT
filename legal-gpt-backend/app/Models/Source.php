<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Source extends Model
{
    use HasFactory;

    // <-- زيد هاد السطر باش تحيد التبعية المطلقة لـ timestamps إيلا بغيتي
    // public $timestamps = true; (إيلا كانو كاينين، خليهم، ولكن زلّق العزلة لتحت)

    protected $fillable = [
        'title',
        'type',
        'url',
        'is_active',
        'local_path',   
        'last_sync',    
        'last_error',   
        'status',
        'category_id',       
    ];

    /**
     * العلاقة مع الـ Chunks/Articles
     */
    public function articles()
    {
        return $this->hasMany(KnowledgeChunk::class);
    }

    public function chunks()
    {
        return $this->hasMany(KnowledgeChunk::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}