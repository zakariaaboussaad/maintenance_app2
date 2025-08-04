<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $table = 'categories';
    protected $primaryKey = 'id_categorie';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nom_categorie',
        'description',
        'couleur',
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
            'is_active' => 'boolean',
        ];
    }

    /**
     * Relationship with Pannes
     */
    public function pannes()
    {
        return $this->hasMany(Panne::class, 'categorie_id', 'id_categorie');
    }

    /**
     * Relationship with Tickets
     */
    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'categorie_id', 'id_categorie');
    }

    /**
     * Scope for active categories
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get pannes count for this category
     */
    public function getPannesCountAttribute()
    {
        return $this->pannes()->count();
    }

    /**
     * Get tickets count for this category
     */
    public function getTicketsCountAttribute()
    {
        return $this->tickets()->count();
    }

    /**
     * Category constants
     */
    const HARDWARE = 'Matériel';
    const SOFTWARE = 'Logiciel';
    const NETWORK = 'Réseau';
    const SECURITY = 'Sécurité';
    const MAINTENANCE = 'Maintenance';
}
