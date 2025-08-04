<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $primaryKey = 'id_user';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nom',
        'prenom',
        'matricule',
        'email',
        'password',
        'numero_telephone',
        'poste_affecte',
        'role_id',
        'is_active',
        'date_embauche',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'date_embauche' => 'date',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the user's full name.
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->prenom} {$this->nom}";
    }

    /**
     * Relationship with Role
     */
    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id', 'id_role');
    }

    /**
     * Relationship with Equipements (assigned equipment)
     */
    public function equipements()
    {
        return $this->hasMany(Equipement::class, 'utilisateur_assigne', 'id_user');
    }

    /**
     * Relationship with Tickets
     */
    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'demandeur_id', 'id_user');
    }

    /**
     * Relationship with Interventions (as technician)
     */
    public function interventions()
    {
        return $this->hasMany(Intervention::class, 'technicien_id', 'id_user');
    }

    /**
     * Relationship with Notifications
     */
    public function notifications()
    {
        return $this->hasMany(Notification::class, 'user_id', 'id_user');
    }

    /**
     * Scope for active users
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for users by role
     */
    public function scopeByRole($query, $roleName)
    {
        return $query->whereHas('role', function ($q) use ($roleName) {
            $q->where('nom_role', $roleName);
        });
    }
}
