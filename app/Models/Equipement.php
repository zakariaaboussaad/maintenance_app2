<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Equipement extends Model
{
    use HasFactory;

    protected $primaryKey = 'numero_serie';
    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'numero_serie',
        'modele',
        'marque',
        'os',
        'date_installation',
        'status',
        'localisation',
        'prix_achat',
        'type_equipement_id',
        'utilisateur_assigne',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date_installation' => 'date',
            'prix_achat' => 'decimal:2',
        ];
    }

    /**
     * Relationship with TypeEquipement
     */
    public function typeEquipement()
    {
        return $this->belongsTo(TypeEquipement::class, 'type_equipement_id', 'id_type');
    }

    /**
     * Relationship with User (assigned user)
     */
    public function utilisateurAssigne()
    {
        return $this->belongsTo(User::class, 'utilisateur_assigne', 'id_user');
    }

    /**
     * Relationship with Pannes
     */
    public function pannes()
    {
        return $this->hasMany(Panne::class, 'equipement_id', 'numero_serie');
    }

    /**
     * Relationship with Tickets
     */
    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'equipement_id', 'numero_serie');
    }

    /**
     * Relationship with Historiques
     */
    public function historiques()
    {
        return $this->hasMany(Historique::class, 'equipement_id', 'numero_serie');
    }

    /**
     * Scope for active equipment
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'Actif');
    }

    /**
     * Scope for equipment by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for equipment by type
     */
    public function scopeByType($query, $typeId)
    {
        return $query->where('type_equipement_id', $typeId);
    }

    /**
     * Scope for assigned equipment
     */
    public function scopeAssigned($query)
    {
        return $query->whereNotNull('utilisateur_assigne');
    }

    /**
     * Scope for unassigned equipment
     */
    public function scopeUnassigned($query)
    {
        return $query->whereNull('utilisateur_assigne');
    }

    /**
     * Get full equipment name
     */
    public function getFullNameAttribute(): string
    {
        $name = $this->modele;
        if ($this->marque) {
            $name = $this->marque . ' ' . $name;
        }
        return $name;
    }
}
