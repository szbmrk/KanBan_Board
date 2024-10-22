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
            $result = shell_exec("{$command}");

            if (!$result) {
                return response()->json(['error' => 'No response from the AI'], 500);
            }

            return $result;
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

}


