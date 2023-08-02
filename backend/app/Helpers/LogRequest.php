<?php
namespace App\Helpers;

class LogRequest
{
    private static $instance;

    public static function instance()
    {
        if (!isset(self::$instance)) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public static function logAction($action, $user_id, $details)
    {
        
        $log = new \App\Models\Log;
        $log->action = $action;
        $log->user_id = $user_id;
        $log->details = $details;
        $log->save();
    }

    public static function logActionMoreDetails($action, $user_id, $details, $task_id, $board_id, $team_id)
    {
        
        $log = new \App\Models\Log;
        $log->action = $action;
        $log->user_id = $user_id;
        $log->details = $details;
        $log->task_id = $task_id;
        $log->board_id = $board_id;
        $log->team_id = $team_id;
        $log->save();
    }
}
