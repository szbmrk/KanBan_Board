<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\ChatGPTController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;


class GeneratePerformanceSummary extends Command
{
    protected $signature = 'performance:generate-summary';

    protected $description = 'Generate performance summary';
    
    
    public function handle()
    {
        $data = [
            "start_date" => "2023-08-14 00:00:00",
            "end_date" => "2023-08-18 23:59:59",
            "board_id" => "8"
        ];
    
        $mockRequest = new Request($data);
    
        $controller = new ChatGPTController();
        $response = $controller->generatePerformanceSummary($mockRequest);
    
        $this->info('Performance summary generated successfully.');
    }

    public function handleGlobal()
    {
        $boardIds = DB::table('logs')->whereNotNull('board_id')->distinct()->pluck('board_id')->toArray();
    
        foreach ($boardIds as $boardId) {
            $data = [
                'start_date' => Carbon::now()->startOfWeek()->toDateTimeString(),
                'end_date' => Carbon::now()->endOfWeek(Carbon::FRIDAY)->toDateTimeString(),
                'board_id' => $boardId
            ];
    
            $request = new Request($data);
    
            app('App\Http\Controllers\ChatGPTController')->generatePerformanceSummary($request);
        }
    }
    
}
