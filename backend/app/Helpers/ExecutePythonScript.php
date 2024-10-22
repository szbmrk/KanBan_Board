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

        $command = escapeshellcmd("python $path \"$prompt\"");
        $output = [];
        $return_var = 0;

        exec($command, $output, $return_var);

        if ($return_var !== 0) {
            return ['error' => 'Command failed with status ' . $return_var, 'output' => implode("\n", $output)];
        }

        if (empty($output)) {
            return ['error' => 'No response from the AI'];
        }

        return implode("\n", $output);
    }

}


