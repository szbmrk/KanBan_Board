<?php
namespace App\Helpers;

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
        $task = "Create a kanban board";
        $column = "To Do";

        // Prepare the prompt to be sent to the Python script
        $prompt = "Generate kanban tickets for $task. Write estimations to the tickets as well and add a tag to each ticket. The tickets should be in the column $column. Write a description to each of them as well";
        // Construct the Python command with the required arguments and path to the script

        $pythonScriptPath = env('PYTHON_SCRIPT_PATH');
        $command = "python $pythonScriptPath \"$prompt\"";

        try {
            // Execute the Python script and capture the output
            $subtask = shell_exec("{$command} 2>&1"); // Redirect stderr to stdout to capture any potential errors

            // Return the subtask as a simple array
            return ['subtask' => $subtask];
        } catch (\Exception $e) {
            // Return the error message as a simple array
            return ['error' => $e->getMessage()];
        }
    }

}


