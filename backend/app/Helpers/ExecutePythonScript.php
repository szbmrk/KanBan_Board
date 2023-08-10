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
        $command = "python $path \"$prompt\"";

        try {

            $result = shell_exec("{$command} 2>&1");
       
            // Return the subtask as a simple array
            return $result;
        } catch (\Exception $e) {
            // Return the error message as a simple array
            return ['error' => $e->getMessage()];
        }
    }

}


