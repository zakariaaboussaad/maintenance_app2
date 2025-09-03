<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PasswordResetApproved extends Mailable
{
    use Queueable, SerializesModels;

    public $userName;
    public $newPassword;
    public $adminName;

    public function __construct($userName, $newPassword, $adminName)
    {
        $this->userName = $userName;
        $this->newPassword = $newPassword;
        $this->adminName = $adminName;
    }

    public function build()
    {
        return $this->subject('Votre mot de passe a été réinitialisé')
                    ->view('emails.password-reset-approved');
    }
}
