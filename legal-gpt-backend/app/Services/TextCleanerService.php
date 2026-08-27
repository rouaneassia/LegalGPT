<?php

namespace App\Services;

class TextCleanerService
{
    public function clean(string $text): string
    {
        // حذف Unicode Control Characters
        $text = preg_replace('/[\x{200E}\x{200F}\x{202A}-\x{202E}\x{2066}-\x{2069}]/u', '', $text);

        // تحويل نهاية الأسطر
        $text = str_replace(["\r", "\f"], "\n", $text);

        // حذف الأسطر الفارغة المتكررة
        $text = preg_replace("/\n{2,}/", "\n", $text);

        // حذف المسافات المتكررة
        $text = preg_replace('/[ \t]+/', ' ', $text);

        // حذف المسافات في بداية ونهاية كل سطر
        $text = preg_replace('/^[ \t]+|[ \t]+$/m', '', $text);

        return trim($text);
    }
}