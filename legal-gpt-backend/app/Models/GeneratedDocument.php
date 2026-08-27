<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GeneratedDocument extends Model
{
    // ✨ السماح بحفظ هذه الحقول في قاعدة البيانات
    protected $fillable = [
        'user_id',
        'template_id',
        'title',
        'content',
        'language',
    ];

    // العلاقة مع المستخدم (صاحب الوثيقة)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // العلاقة مع القالب (Template)
    public function template()
    {
        return $this->belongsTo(Template::class);
    }
}