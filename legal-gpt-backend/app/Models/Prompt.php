<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prompt extends Model
{
    use HasFactory;

    // هادو هما الحقول اللي غالبا كتحتاجهم بناءً على Service ديالك
   protected $fillable = [
    'key',
    'title',
    'description',
    'system_prompt',
    'is_active',
];
}