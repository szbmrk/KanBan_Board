<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CustomResetPasswordNotification extends Notification
{
    use Queueable;
    protected $token; // Declare the token property

    /**
     * Create a new notification instance.
     */
    public function __construct($token, $email)
    {
        //parent::__construct($token); // Call the parent constructor
        $this->token = $token; // Store the token in the property
        $this->email = $email; // Store the email in the property
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    // Override the toMail method to customize the email
    public function toMail($notifiable)
    {
        $customUrl = $this->customizeUrl($this->token); // Pass the token here

        return (new MailMessage)
            ->subject('Reset Password Notification')
            ->line('You are receiving this email because we received a password reset request for your account.')
            ->action('Reset Password', $customUrl)
            ->line('If you did not request a password reset, no further action is required.');
    }

    protected function customizeUrl($token)
    {
        $baseUrl = env('APP_URL');
        // Create the new URL with the desired format
        return "{$baseUrl}/agi-kanban/password/reset/{$token}?email={$this->email}";
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
