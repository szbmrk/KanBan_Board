<?php

namespace App\Traits;

use Illuminate\Support\Carbon;

trait AdjustTimestampsForHungaryTrait
{
    protected static function bootAdjustTimestampsForHungaryTrait()
    {
        static::creating(function ($model) {
            // Set the time zone to Hungary (Europe/Budapest)
            $carbonTimestamp = Carbon::parse($model->timestamp_column, 'Europe/Budapest');

            // Check if DST (Daylight Saving Time) is in effect
            if ($carbonTimestamp->isDST()) {
                // Add 2 hours during DST
                $carbonTimestamp->addHours(2);
            } else {
                // Add 1 hour outside DST
                $carbonTimestamp->addHour(1);
            }

            // Convert back to UTC before saving to the database
            $model->created_at = $carbonTimestamp->utc();
            $model->updated_at = $carbonTimestamp->utc();
        });

        static::updating(function ($model) {
            // Set the time zone to Hungary (Europe/Budapest)
            $carbonTimestamp = Carbon::parse($model->timestamp_column, 'Europe/Budapest');

            // Check if DST (Daylight Saving Time) is in effect
            if ($carbonTimestamp->isDST()) {
                // Add 2 hours during DST
                $carbonTimestamp->addHours(2);
            } else {
                // Add 1 hour outside DST
                $carbonTimestamp->addHour(1);
            }

            // Convert back to UTC before saving to the database
            $model->updated_at = $carbonTimestamp->utc();
        });
    }
}
