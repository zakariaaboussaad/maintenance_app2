<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StatusPanne extends Model
{
    use HasFactory;

    protected $table = 'status_pannes';
    protected $primaryKey = 'id_status';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nom_status',
        'description',
        'couleur',
        'is_final',
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
            'is_final' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Relationship with Pannes
     */
    public function pannes()
    {
        return $this->hasMany(Panne::class, 'status_id', 'id_status');
    }

    /**
     * Relationship with Tickets
     */
    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'status_id', 'id_status');
    }

    /**
     * Scope for active statuses
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for final statuses
     */
    public function scopeFinal($query)
    {
        return $query->where('is_final', true);
    }

    /**
     * Scope for non-final statuses
     */
    public function scopeInProgress($query)
    {
        return $query->where('is_final', false);
    }

    /**
     * Get pannes count for this status
     */
    public function getPannesCountAttribute()
    {
        return $this->pannes()->count();
    }

    /**
     * Status constants
     */
    const NOUVEAU = 'Nouveau';
    const EN_COURS = 'En cours';
    const EN_ATTENTE = 'En attente';
    const RESOLU = 'Résolu';
    const FERME = 'Fermé';
    const ANNULE = 'Annulé';
}
