<?php

namespace App\Services;

class ArticleExtractorService
{
    public function extract($source)
    {
        // Logic for extracting content/articles from source
        return true;
    }

    /**
     * ميثود مطابقة لكي تشتغل KnowledgeImportService بدون أخطاء
     */
    public function extractAll($chunk)
    {
        // إذا بغيت تطبق المنطق الخاص بك أو تستعمل extract القديمة
        if (is_string($chunk)) {
            preg_match('/المادة\s*\d+/u', $chunk, $matches);
            return $matches[0] ?? null;
        }

        return $this->extract($chunk);
    }
}