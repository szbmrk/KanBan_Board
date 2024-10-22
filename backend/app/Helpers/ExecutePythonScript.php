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

        $command = "python {$path} " . escapeshellarg($prompt) . " " . escapeshellarg($apiKey);
        $response = shell_exec($command);

        if (empty($response)) {
            return ['error' => 'No response from the AI'];
        }

        if (strpos($response[0], 'Error:') !== false) {
            $response[0] = substr($response[0], 7);

            $json = json_decode($response[0], true);
            if ($json) {
                if (array_key_exists('error', $json)) {
                    if (array_key_exists('message', $json['error'])) {
                        return ['error' => $json['error']['message']];
                    }
                }
            }

            return ['error' => $response[0]];
        }

        return $response;
    }

}


