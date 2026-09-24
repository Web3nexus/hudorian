<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ResetPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public string $token;
    public string $resetUrl;

    public function __construct(User $user, string $token, string $resetUrl)
    {
        $this->user = $user;
        $this->token = $token;
        $this->resetUrl = $resetUrl;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'HUDORIAN — Security Clearance Keyphrase Reset',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.reset_password',
            with: [
                'userName' => $this->user->name,
                'userEmail' => $this->user->email,
                'resetUrl' => $this->resetUrl,
            ],
        );
    }
}

