<?php

namespace App\Services;

class SynonymService
{
    protected array $dictionary = [

        'اختصاصات' => [
            'صلاحيات',
            'مهام',
            'وظائف',
        ],

        'صلاحيات' => [
            'اختصاصات',
            'مهام',
        ],

        'محكمة النقض' => [
            'المحكمة العليا',
        ],

        'المحكمة العليا' => [
            'محكمة النقض',
        ],

        'هيئة' => [
            'مؤسسة',
            'جهاز',
        ],

        'مؤسسة' => [
            'هيئة',
        ],

        'قانون' => [
            'تشريع',
            'نص قانوني',
        ],

        'تشريع' => [
            'قانون',
        ],
    ];

    public function expand(array $words): array
    {
        $expanded = $words;

        foreach ($words as $word) {

            if (isset($this->dictionary[$word])) {

                $expanded = array_merge(
                    $expanded,
                    $this->dictionary[$word]
                );
            }
        }

        return array_values(array_unique($expanded));
    }
}