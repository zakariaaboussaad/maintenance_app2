<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';
    protected $primaryKey = 'id_user'; // ✅ Your primary key
    public $incrementing = true;
    protected $keyType = 'int';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'prenom',
        'nom',
        'name',
        'email',
        'password',
        'default_password',
        'must_change_password',
        'password_updated_at',
        'password_expiry_notified_at',
        'password_expiry_days_remaining',
        'role_id',
        'matricule',
        'numero_telephone',
        'poste_affecte',
        'gender',
        'is_active',
        'date_embauche',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'date_embauche' => 'date',
        'is_active' => 'boolean',
        'role_id' => 'integer',
        'must_change_password' => 'boolean',
        'password_updated_at' => 'datetime',
        'password_expiry_notified_at' => 'datetime',
    ];

    /**
     * Get the user's full name.
     */
    public function getFullNameAttribute()
    {
        return trim(($this->prenom ?? '') . ' ' . ($this->nom ?? ''));
    }

    /**
     * Get the name attribute (for Laravel Auth compatibility)
     * Only use dynamic generation if name field is empty
     */
    public function getNameAttribute($value)
    {
        // If name is explicitly set in database, use it
        if (!empty($value)) {
            return $value;
        }
        
        // Otherwise, generate from prenom + nom
        return $this->getFullNameAttribute();
    }

    /**
     * Vérifier si l'utilisateur est admin
     */
    public function isAdmin()
    {
        return $this->role_id === 1;
    }

    /**
     * Vérifier si l'utilisateur est technicien
     */
    public function isTechnician()
    {
        return $this->role_id === 2;
    }

    /**
     * Vérifier si l'utilisateur est utilisateur standard
     */
    public function isUser()
    {
        return $this->role_id === 3;
    }

    /**
     * Role relationship
     */
    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id', 'id_role');
    }

    /**
     * Get the role name
     */
    public function getRoleNameAttribute()
    {
        switch ($this->role_id) {
            case 1:
                return 'Administrateur';
            case 2:
                return 'Technicien';
            case 3:
                return 'Utilisateur';
            default:
                return 'Non défini';
        }
    }

    /**
     * Scope pour les utilisateurs actifs
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope pour filtrer par rôle
     */
    public function scopeByRole($query, $roleId)
    {
        return $query->where('role_id', $roleId);
    }

    /**
     * Relationship with tickets created by this user
     */
    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'user_id', 'id_user');
    }

    /**
     * Relationship with tickets assigned to this user as technician
     */
    public function assignedTickets()
    {
        return $this->hasMany(Ticket::class, 'technicien_assigne', 'id_user');
    }

    /**
     * Check if user needs to change password
     */
    public function needsPasswordChange()
    {
        return $this->must_change_password;
    }

    /**
     * Calculate password expiry days remaining
     */
    public function getPasswordExpiryDaysRemaining()
    {
        if (!$this->password_updated_at) {
            return 0; // Password is expired
        }

        $expiryDate = $this->password_updated_at->addMonths(3);
        $daysRemaining = now()->diffInDays($expiryDate, false);
        
        return max(0, (int) $daysRemaining);
    }

    /**
     * Check if password is expired
     */
    public function isPasswordExpired()
    {
        return $this->getPasswordExpiryDaysRemaining() <= 0;
    }

    /**
     * Check if password needs warning (less than 30 days remaining)
     */
    public function needsPasswordExpiryWarning()
    {
        $daysRemaining = $this->getPasswordExpiryDaysRemaining();
        return $daysRemaining > 0 && $daysRemaining <= 30;
    }

    /**
     * Update password expiry tracking
     */
    public function updatePasswordExpiry()
    {
        $this->update([
            'password_updated_at' => now(),
            'password_expiry_notified_at' => null,
            'password_expiry_days_remaining' => 90, // 3 months
            'must_change_password' => false
        ]);
    }
}
