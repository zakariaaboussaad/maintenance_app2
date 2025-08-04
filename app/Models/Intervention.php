<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Intervention extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_intervention';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'description_intervention',
        'date_debut',
        'date_fin',
        'duree_minutes',
        'type_intervention',
        'cout',
        'pieces_utilisees',
        'commentaires',
        'is_successful',
        'technicien_id',
        'ticket_id',
        'panne_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date_debut' => 'datetime',
            'date_fin' => 'datetime',
            'duree_minutes' => 'integer',
            'cout' => 'decimal:2',
            'pieces_utilisees' => 'array',
            'is_successful' => 'boolean',
        ];
    }

    /**
     * Relationship with User (technicien)
     */
    public function technicien()
    {
        return $this->belongsTo(User::class, 'technicien_id', 'id_user');
    }

    /**
     * Relationship with Ticket
     */
    public function ticket()
    {
        return $this->belongsTo(Ticket::class, 'ticket_id', 'id_ticket');
    }

    /**
     * Relationship with Panne
     */
    public function panne()
    {
        return $this->belongsTo(Panne::class, 'panne_id', 'id_panne');
    }

    /**
     * Relationship with Historiques
     */
    public function historiques()
    {
        return $this->hasMany(Historique::class, 'intervention_id', 'id_intervention');
    }

    /**
     * Boot method to calculate duration
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($intervention) {
            if ($intervention->date_debut && $intervention->date_fin) {
                $intervention->duree_minutes = $intervention->date_debut->diffInMinutes($intervention->date_fin);
            }
        });
    }

    /**
     * Scope for successful interventions
     */
    public function scopeSuccessful($query)
    {
        return $query->where('is_successful', true);
    }

    /**
     * Scope for failed interventions
     */
    public function scopeFailed($query)
    {
        return $query->where('is_successful', false);
    }

    /**
     * Scope for interventions by technician
     */
    public function scopeByTechnician($query, $technicianId)
    {
        return $query->where('technicien_id', $technicianId);
    }

    /**
     * Scope for interventions by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type_intervention', $type);
    }

    /**
     * Scope for completed interventions
     */
    public function scopeCompleted($query)
    {
        return $query->whereNotNull('date_fin');
    }

    /**
     * Scope for ongoing interventions
     */
    public function scopeOngoing($query)
    {
        return $query->whereNotNull('date_debut')->whereNull('date_fin');
    }

    /**
     * Get duration in human readable format
     */
    public function getDurationHumanAttribute(): ?string
    {
        if (!$this->duree_minutes) {
            return null;
        }

        $hours = floor($this->duree_minutes / 60);
        $minutes = $this->duree_minutes % 60;

        if ($hours > 0) {
            return $hours . 'h ' . $minutes . 'min';
        }

        return $minutes . 'min';
    }

    /**
     * Get pieces cost total
     */
    public function getPiecesCostAttribute(): float
    {
        if (!$this->pieces_utilisees) {
            return 0;
        }

        return collect($this->pieces_utilisees)->sum('prix') ?? 0;
    }

    /**
     * Get total cost (intervention + pieces)
     */
    public function getTotalCostAttribute(): float
    {
        return ($this->cout ?? 0) + $this->pieces_cost;
    }

    /**
     * Check if intervention is completed
     */
    public function getIsCompletedAttribute(): bool
    {
        return !is_null($this->date_fin);
    }

    /**
     * Get intervention status
     */
    public function getStatusAttribute(): string
    {
        if (!$this->date_debut) {
            return 'Planifiée';
        }

        if (!$this->date_fin) {
            return 'En cours';
        }

        return $this->is_successful ? 'Terminée avec succès' : 'Terminée avec échec';
    }

    /**
     * Type constants
     */
    const TYPE_PREVENTIVE = 'Préventive';
    const TYPE_CORRECTIVE = 'Corrective';
    const TYPE_URGENTE = 'Urgente';
    const TYPE_MAINTENANCE = 'Maintenance';
}
