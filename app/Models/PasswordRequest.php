<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PasswordRequest extends Model
{
    use HasFactory;

    protected $table = 'password_requests';
    protected $primaryKey = 'id';

    protected $fillable = [
        'user_id',
        'reason',
        'status',
        'new_password',
        'rejection_reason',
        'approved_by',
        'rejected_by',
        'requested_at',
        'approved_at',
        'rejected_at'
    ];

    protected $casts = [
        'requested_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    /**
     * Get the user who made the password request
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id_user');
    }

    /**
     * Get the admin who approved the request
     */
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by', 'id_user');
    }

    /**
     * Get the admin who rejected the request
     */
    public function rejecter()
    {
        return $this->belongsTo(User::class, 'rejected_by', 'id_user');
    }

    /**
     * Scope for pending requests
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for approved requests
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope for rejected requests
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }
}
