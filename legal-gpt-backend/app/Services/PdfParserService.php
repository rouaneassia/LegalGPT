<?php

namespace App\Services;

use Smalot\PdfParser\Parser;
use Illuminate\Support\Facades\Log;

class PdfParserService
{
    /**
     * استخراج النص من ملف الـ PDF مع الحماية ضد الملفات التالفة.
     */
    public function extract(string $path): string
    {
        if (!file_exists($path)) {
            throw new \Exception("PDF file not found for parsing: {$path}");
        }

        try {
            $parser = new Parser();
            $pdf = $parser->parseFile($path);
            $text = $pdf->getText();

            // التحقق واش النص خاوي ولا الملف عبارة عن صور (Scanned PDF)
            if (empty(trim($text))) {
                throw new \Exception("The PDF file contains no readable text. It might be a scanned image or protected.");
            }

            return $text;

        } catch (\Throwable $e) {
            // تسجيل الخطأ في الـ Logs للرجوع إليه إذا لزم الأمر
            Log::error("PDF Parser Error on file {$path}: " . $e->getMessage());
            
            // رمي خطأ واضح يفهمه الـ Service
            throw new \Exception("PDF structure error: " . $e->getMessage());
        }
    }

    /**
     * ميثود احتياطية لتفادي أي خطأ في اسم الدالة.
     */
    public function parse(string $path): string
    {
        return $this->extract($path);
    }
}