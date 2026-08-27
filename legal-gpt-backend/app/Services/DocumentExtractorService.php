<?php

namespace App\Services;

class DocumentExtractorService
{
    private string $pdfToText;
    private string $pdfInfo;

    public function __construct()
    {
        $base = 'C:\Users\client\Downloads\Release-26.02.0-0 (1)\poppler-26.02.0\Library\bin\\';

        $this->pdfToText = $base . 'pdftotext.exe';
        $this->pdfInfo   = $base . 'pdfinfo.exe';
    }

    /**
     * استخراج جميع صفحات PDF.
     */
    public function extractPages(string $pdfPath): array
    {
        if (!file_exists($pdfPath)) {
            throw new \Exception("PDF not found: {$pdfPath}");
        }

        $pageCount = $this->getPageCount($pdfPath);

        $pages = [];

        for ($page = 1; $page <= $pageCount; $page++) {

            $txtPath = storage_path(
                'app/private/legal/texts/' . uniqid() . '.txt'
            );

            if (!is_dir(dirname($txtPath))) {
                mkdir(dirname($txtPath), 0777, true);
            }

            $command =
                '"' . $this->pdfToText . '"' .
                ' -layout' .
                ' -f ' . $page .
                ' -l ' . $page .
                ' "' . $pdfPath . '"' .
                ' "' . $txtPath . '"';

           $output = [];
$status = 0;

exec($command . " 2>&1", $output, $status);

if ($status !== 0) {
    throw new \Exception(implode("\n", $output));
}

            if (!file_exists($txtPath)) {
                continue;
            }

            $text = trim(file_get_contents($txtPath));

            unlink($txtPath);

            if ($text === '') {
                continue;
            }

            $pages[] = [
                'page' => $page,
                'content' => $text,
            ];
        }

        return $pages;
    }

    /**
     * استخراج عدد صفحات PDF.
     */
    private function getPageCount(string $pdfPath): int
    {
        $command =
            '"' . $this->pdfInfo . '"' .
            ' "' . $pdfPath . '"';

        $output = [];
$status = 0;

exec($command . " 2>&1", $output, $status);

if ($status !== 0) {
    throw new \Exception("pdfinfo failed:\n" . implode("\n", $output));
}

        foreach ($output as $line) {

            if (str_starts_with($line, 'Pages:')) {

                return (int) trim(
                    str_replace('Pages:', '', $line)
                );

            }
        }

        throw new \Exception('Unable to detect page count.');
    }
}