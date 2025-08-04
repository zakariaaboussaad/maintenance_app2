<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_role';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nom_role',
        'description',
        'permissions',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'permissions' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Relationship with Users
     */
    public function users()
    {
        return $this->hasMany(User::class, 'role_id', 'id_role');
    }

    /**
     * Scope for active roles
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get users count for this role
     */
    public function getUsersCountAttribute()
    {
        return $this->users()->count();
    }

    /**
     * Check if role has specific permission
     */
    public function hasPermission($permission): bool
    {
        return in_array($permission, $this->permissions ?? []);
    }

    /**
     * Common role constants
     */
    const ADMIN = 'Administrateur';
    const TECHNICIAN = 'Technicien';
    const USER = 'Utilisateur';
    const MANAGER = 'Gestionnaire';
}
