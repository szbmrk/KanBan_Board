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
}
