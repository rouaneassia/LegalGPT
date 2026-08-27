<?php

namespace App\Services;

use App\Models\KnowledgeChunk;
use App\Models\Source;

class KnowledgeImportService
{
    protected ChunkService $chunker;
    protected DocumentExtractorService $extractor;
    protected ArticleExtractorService $articleExtractor;

    public function __construct(
        ChunkService $chunker,
        DocumentExtractorService $extractor,
        ArticleExtractorService $articleExtractor
    ) {
        $this->chunker = $chunker;
        $this->extractor = $extractor;
        $this->articleExtractor = $articleExtractor;
    }

    public function import(Source $source): int
    {
        // حذف الـ chunks القديمة
        KnowledgeChunk::where('source_id', $source->id)->delete();

        // التأكد من أن local_path كاين، وإذا كان خاوي نحاولوا نجيبوه بالطريقة الافتراضية
        $localPath = $source->local_path;
        
        if (empty($localPath)) {
            // بحث افتراضي على الملف إذا كان محفوظاً في legal/
            $files = glob(storage_path('app/private/legal/*_' . $source->id . '.pdf'));
            if (!empty($files)) {
                $localPath = 'legal/' . basename($files[0]);
                // تحديثه في القاعدة لتفادي المشكل لاحقاً
                $source->update(['local_path' => $localPath]);
            } else {
                throw new \Exception("PDF local_path is empty for source ID: {$source->id}");
            }
        }

        // مسار الـ PDF الكامل
        $path = storage_path('app/private/' . $localPath);

        if (!file_exists($path)) {
            throw new \Exception("PDF file not found at path: {$path}");
        }

        // استخراج الصفحات
        $pages = $this->extractor->extractPages($path);

        $totalChunks = 0;
        $totalCharacters = 0;
        $totalArticles = 0;

        foreach ($pages as $pageData) {

            $page = $pageData['page'] ?? null;
            $content = $pageData['content'] ?? '';

            if (trim($content) === '') {
                continue;
            }

            // تقسيم الصفحة إلى Chunks
            $chunks = $this->chunker->split($content);

            foreach ($chunks as $index => $chunk) {

                // تنظيف Encoding
                $chunk = mb_convert_encoding(
                    $chunk,
                    'UTF-8',
                    'UTF-8'
                );

                $chunk = iconv(
                    'UTF-8',
                    'UTF-8//IGNORE',
                    $chunk
                );

                // تنظيف النص
                $chunk = str_replace(
                    ["\r", "\f"],
                    "\n",
                    $chunk
                );

                $chunk = preg_replace(
                    "/\n+/u",
                    "\n",
                    $chunk
                );

                // حذف علامات الاتجاه
                $chunk = preg_replace(
                    '/[\x{200E}\x{200F}\x{202A}-\x{202E}\x{2066}-\x{2069}]/u',
                    '',
                    $chunk
                );

                $chunk = trim($chunk);

                if ($chunk === '') {
                    continue;
                }

                // استخراج المادة
                $article = $this->articleExtractor->extractAll($chunk);

                if ($article !== null) {
                    $totalArticles++;
                }

                $totalCharacters += mb_strlen($chunk);

                KnowledgeChunk::create([
                    'source_id'   => $source->id,
                    'chunk_index' => $index,
                    'page'        => $page,
                    'article'     => $article,
                    'content'     => $chunk,
                    'characters'  => mb_strlen($chunk),
                ]);

                $totalChunks++;
            }
        }

        return $totalChunks;
    }
}