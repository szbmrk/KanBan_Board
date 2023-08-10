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



    public static function Run()
    {
        $task = "Develop a kanban board application with mysql - laravel - react";

        $todayDate = Carbon::today()->format('Y-m-d');

        // Prepare the prompt to be sent to the Python script
        $prompt = "Generate 10 kanban tickets in json format with title, description, deadline (if the start date is now '$todayDate' in yyyy-mm-dd) and tag attributes for this task: '$task'";
        // Construct the Python command with the required arguments and path to the script

        $pythonScriptPath = env('PYTHON_SCRIPT_PATH');
        $command = "python $pythonScriptPath \"$prompt\"";

        try {
            // Execute the Python script and capture the output
            $subtask = shell_exec("{$command} 2>&1"); // Redirect stderr to stdout to capture any potential errors

            //New prompt
            $prompt = "Please modify this data to be in json format: '$subtask'";
            
            //New command
            $command = "python $pythonScriptPath \"$prompt\"";

            //Second call
            $result = shell_exec("{$command} 2>&1"); 

            // Return the subtask as a simple array
            return $result;
        } catch (\Exception $e) {
            // Return the error message as a simple array
            return ['error' => $e->getMessage()];
        }
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


