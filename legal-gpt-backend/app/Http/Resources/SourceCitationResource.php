<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SourceCitationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'title' => $this->source->title,
            'page' => $this->page,
            'score' => round($this->score ?? 0, 2),
        ];
    }
}