<?php
namespace App\Helpers;
use Carbon\Carbon;
use App\Models\Priority;

class ExecutePythonScript
{
    private static $instance;

    public static function instance()
    {
        if (!isset(self::$instance)) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public static function GenerateApiResponse($prompt, $path)
    {
        if (!file_exists($path)) {
            $error = 'File does not exist: ' . $path;
            return ['error' => $error];
        }

        if (empty($prompt)) {
            return ['error' => 'Prompt is empty'];
        }

        $apiKey = config('agiconfig.OPENAI_API_KEY');
        return ['error' => $apiKey];
        $command = "python {$path} " . escapeshellarg($prompt) . " " . escapeshellarg($apiKey);
        $response = shell_exec($command);
        return $response;
    }

}


