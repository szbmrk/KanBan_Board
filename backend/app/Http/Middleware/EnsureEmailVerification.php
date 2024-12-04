<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmailVerification
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        // Validate the signed URL
        if (!URL::hasValidSignature($request)) {
            \Log::info('Invalid or expired signature.', ['url' => $request->fullUrl()]);
            return response()->json(['message' => 'Email verification failed. The link may have expired or is invalid.'], 403);
        }

        \Log::info('Valid signature and not expired.', ['url' => $request->fullUrl()]);
        return $next($request);
    }
}
