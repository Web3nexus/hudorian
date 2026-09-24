<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeMemberMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public string $membershipNumber;
    public string $planName;
    public string $portalUrl;

    public function __construct(User $user, string $membershipNumber = 'HUD-MEMBER', string $planName = 'Founding Patron')
    {
        $this->user = $user;
        $this->membershipNumber = $membershipNumber;
        $this->planName = $planName;
        $this->portalUrl = rtrim(config('app.url', 'https://hudorian.com'), '/') . '/member';
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to HUDORIAN — Private Members Club',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.welcome_member',
            with: [
                'userName' => $this->user->name,
                'membershipNumber' => $this->membershipNumber,
                'planName' => $this->planName,
                'portalUrl' => $this->portalUrl,
            ],
        );
    }
}

