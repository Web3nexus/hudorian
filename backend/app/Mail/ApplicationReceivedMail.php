<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ApplicationReceivedMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $applicantName;
    public string $planName;

    public function __construct(string $applicantName, string $planName = 'Global House Patron')
    {
        $this->applicantName = $applicantName;
        $this->planName = $planName;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'HUDORIAN — Candidacy Dossier Received',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.application_received',
            with: [
                'applicantName' => $this->applicantName,
                'planName' => $this->planName,
            ],
        );
    }
}

