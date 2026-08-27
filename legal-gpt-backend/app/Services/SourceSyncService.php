<?php

namespace App\Services;

use App\Models\Source;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use App\Services\PdfParserService;
use App\Services\KnowledgeImportService;
use App\Services\AI\EmbeddingService;

class SourceSyncService
{
    protected PdfParserService $parser;
    protected KnowledgeImportService $importer;
    protected EmbeddingService $embeddingService;

    public function __construct(
        PdfParserService $parser, 
        KnowledgeImportService $importer,
        EmbeddingService $embeddingService
    ) {
        $this->parser = $parser;
        $this->importer = $importer;
        $this->embeddingService = $embeddingService;
    }

    public function sync(Source $source)
    {
        // رفع حدود الوقت والذاكرة للعمليات الكبيرة
        ini_set('max_execution_time', 600);
        ini_set('memory_limit', '1024M');

        try {
            // 1. تحديث الحالة إلى downloading
            $source->update([
                'status' => 'downloading',
                'last_error' => null,
            ]);

            $directory = storage_path('app/private/legal');
            if (!is_dir($directory)) {
                mkdir($directory, 0777, true);
            }

            $textsDirectory = storage_path('app/private/legal/texts');
            if (!is_dir($textsDirectory)) {
                mkdir($textsDirectory, 0777, true);
            }

            $filename = time() . '_' . $source->id . '.pdf';
            $path = $directory . DIRECTORY_SEPARATOR . $filename;

            // 2. التحقق واش الرابط خارجي ولا محلي مع إعدادات cURL ومقاومة الحظر
            if (filter_var($source->url, FILTER_VALIDATE_URL)) {
                $cleanUrl = strtok($source->url, '#');

                $response = Http::withOptions([
                    'verify' => false, 
                    'stream' => true,
                    'curl' => [
                        CURLOPT_SSLVERSION => CURL_SSLVERSION_TLSv1_2,
                        CURLOPT_FOLLOWLOCATION => true,
                    ],
                ])->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Accept' => 'application/pdf,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'Referer' => 'https://adala.justice.gov.ma/',
                ])->timeout(120)->get($cleanUrl);

                if (! $response->successful()) {
                    throw new \Exception('Download failed from external URL with Status: ' . $response->status());
                }

                $content = $response->body();

                // التأكد واش الملف اللي تحلل هو PDF بصح ماشي صفحة HTML
                $startContent = strtolower(substr($content, 0, 150));
                if (str_contains($startContent, '<html') || str_contains($startContent, '<doctype') || str_contains($startContent, '<head')) {
                    throw new \Exception('The downloaded file is an HTML page, not a valid PDF. The URL might be blocked, expired, or incorrect.');
                }

                file_put_contents($path, $content);
            } else {
                $localSourcePath = public_path($source->url);
                
                if (file_exists($localSourcePath)) {
                    copy($localSourcePath, $path);
                } else {
                    throw new \Exception('Local file not found or invalid URL format');
                }
            }

            if (! file_exists($path)) {
                throw new \Exception('PDF not saved successfully');
            }

            // 6. تحديث local_path في القاعدة
            $source->update([
                'local_path' => 'legal/' . $filename,
            ]);

            // 7. استخراج النص من ملف PDF
            $text = $this->parser->extract($path);

            // 8. حفظ النص المستخرج
            file_put_contents(
                $textsDirectory . DIRECTORY_SEPARATOR . $source->id . '.txt',
                $text
            );

            // 9. التحديث النهائي للحالة
            $source->update([
                'status' => 'downloaded',
                'last_sync' => now(),
                'last_error' => null,
            ]);

            // 10. إنشاء الـ Chunks الخاصة بالمعرفة
            $this->importer->import($source);

            // 11. توليد وتخزين الـ Embeddings لجميع الـ Chunks
            foreach ($source->chunks as $chunk) {
                $this->embeddingService->generateAndStore($chunk);
            }

        } catch (\Throwable $e) {
            // تسجيل الخطأ الحقيقي وحفظه في الـ database بكل تفاصيله
            $source->update([
                'status' => 'failed',
                'last_error' => 'CRITICAL: ' . $e->getMessage() . ' in ' . basename($e->getFile()) . ':' . $e->getLine(),
            ]);

            throw new \Exception('Sync Error: ' . $e->getMessage() . ' [Line: ' . $e->getLine() . ']');
        }
    }
}