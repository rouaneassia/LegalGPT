<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TemplateSection extends Model
{
    protected $fillable = ['template_id', 'title', 'content', 'order'];

    public function template()
    {
        return $this->belongsTo(Template::class);
    }
}