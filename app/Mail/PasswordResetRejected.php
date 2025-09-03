<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PasswordResetRejected extends Mailable
{
    use Queueable, SerializesModels;

    public $userName;
    public $rejectionReason;
    public $adminName;

    public function __construct($userName, $rejectionReason, $adminName)
    {
        $this->userName = $userName;
        $this->rejectionReason = $rejectionReason;
        $this->adminName = $adminName;
    }

    public function build()
    {
        return $this->subject('Demande de réinitialisation de mot de passe rejetée')
                    ->view('emails.password-reset-rejected');
    }
}
