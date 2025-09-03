<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PasswordReset extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'email',
        'token',
        'status',
        'reason',
        'new_password',
        'rejection_reason',
        'approved_by',
        'rejected_by',
        'approved_at',
        'rejected_at'
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by', 'id_user');
    }

    public function rejectedBy()
    {
        return $this->belongsTo(User::class, 'rejected_by', 'id_user');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'email', 'email');
    }
}
