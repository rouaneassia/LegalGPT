<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Template extends Model
{
    protected $fillable = ['title', 'description'];

    public function sections()
    {
        return $this->hasMany(TemplateSection::class);
    }

    public function instructions()
    {
        return $this->hasMany(Instruction::class);
    }
}