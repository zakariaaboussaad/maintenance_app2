<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Panne extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_panne';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'titre',
        'description',
        'date_signalement',
        'date_resolution',
        'priorite',
        'temps_resolution',
        'equipement_id',
        'categorie_id',
        'status_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date_signalement' => 'datetime',
            'date_resolution' => 'datetime',
            'temps_resolution' => 'integer', // in minutes
        ];
    }

    /**
     * Relationship with Equipement
     */
    public function equipement()
    {
        return $this->belongsTo(Equipement::class, 'equipement_id', 'numero_serie');
    }

    /**
     * Relationship with Category
     */
    public function categorie()
    {
        return $this->belongsTo(Category::class, 'categorie_id', 'id_categorie');
    }

    /**
     * Relationship with StatusPanne
     */
    public function status()
    {
        return $this->belongsTo(StatusPanne::class, 'status_id', 'id_status');
    }

    /**
     * Relationship with Tickets
     */
    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'panne_id', 'id_panne');
    }

    /**
     * Relationship with Interventions
     */
    public function interventions()
    {
        return $this->hasMany(Intervention::class, 'panne_id', 'id_panne');
    }

    /**
     * Relationship with Historiques
     */
    public function historiques()
    {
        return $this->hasMany(Historique::class, 'panne_id', 'id_panne');
    }

    /**
     * Scope for high priority pannes
     */
    public function scopeHighPriority($query)
    {
        return $query->where('priorite', 'Haute');
    }

    /**
     * Scope for open pannes
     */
    public function scopeOpen($query)
    {
        return $query->whereHas('status', function ($q) {
            $q->where('is_final', false);
        });
    }

    /**
     * Scope for resolved pannes
     */
    public function scopeResolved($query)
    {
        return $query->whereHas('status', function ($q) {
            $q->where('is_final', true);
        });
    }

    /**
     * Scope for pannes by priority
     */
    public function scopeByPriority($query, $priority)
    {
        return $query->where('priorite', $priority);
    }

    /**
     * Get resolution time in human readable format
     */
    public function getResolutionTimeHumanAttribute(): ?string
    {
        if (!$this->temps_resolution) {
            return null;
        }

        $hours = floor($this->temps_resolution / 60);
        $minutes = $this->temps_resolution % 60;

        if ($hours > 0) {
            return $hours . 'h ' . $minutes . 'min';
        }

        return $minutes . 'min';
    }

    /**
     * Check if panne is overdue (example: more than 24h for high priority)
     */
    public function getIsOverdueAttribute(): bool
    {
        if ($this->status->is_final) {
            return false;
        }

        $hoursLimit = match ($this->priorite) {
            'Haute' => 4,
            'Moyenne' => 24,
            'Basse' => 72,
            default => 24
        };

        return Carbon::now()->diffInHours($this->date_signalement) > $hoursLimit;
    }

    /**
     * Get time since reported
     */
    public function getTimeSinceReportedAttribute(): string
    {
        return $this->date_signalement->diffForHumans();
    }

    /**
     * Priority constants
     */
    const PRIORITY_HIGH = 'Haute';
    const PRIORITY_MEDIUM = 'Moyenne';
    const PRIORITY_LOW = 'Basse';
}
