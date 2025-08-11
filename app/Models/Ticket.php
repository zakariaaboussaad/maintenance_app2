<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Ticket extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'titre',
        'description',
        'priorite',
        'status',
        'user_id',
        'equipement_id',
        'technicien_assigne',
        'categorie_id',
        'date_creation',
        'date_assignation',
        'date_resolution',
        'date_fermeture',
        'commentaire_resolution',
        'temps_resolution',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date_creation' => 'datetime',
            'date_assignation' => 'datetime',
            'date_resolution' => 'datetime',
            'date_fermeture' => 'datetime',
        ];
    }

    /**
     * Relationship with User (who created the ticket)
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id_user');
    }

    /**
     * Relationship with User (assigned technician)
     */
    public function technicien()
    {
        return $this->belongsTo(User::class, 'technicien_assigne', 'id_user');
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
        return $this->belongsTo(Category::class, 'categorie_id', 'id');
    }

    /**
     * Scope for open tickets
     */
    public function scopeOpen($query)
    {
        return $query->whereNotIn('status', ['resolu', 'ferme', 'annule']);
    }

    /**
     * Scope for closed tickets
     */
    public function scopeClosed($query)
    {
        return $query->whereIn('status', ['resolu', 'ferme', 'annule']);
    }

    /**
     * Scope for high priority tickets
     */
    public function scopeHighPriority($query)
    {
        return $query->whereIn('priorite', ['haute', 'critique']);
    }

    /**
     * Scope for tickets by user
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Get time since creation
     */
    public function getTimeSinceCreationAttribute(): string
    {
        return $this->date_creation->diffForHumans();
    }

    /**
     * Get resolution time if closed
     */
    public function getResolutionTimeAttribute(): ?int
    {
        if (!$this->date_resolution) {
            return null;
        }

        return $this->date_creation->diffInMinutes($this->date_resolution);
    }

    /**
     * Check if ticket is overdue
     */
    public function getIsOverdueAttribute(): bool
    {
        if (in_array($this->status, ['resolu', 'ferme', 'annule'])) {
            return false;
        }

        $hoursLimit = match ($this->priorite) {
            'critique' => 2,
            'haute' => 4,
            'normale' => 24,
            'basse' => 72,
            default => 24
        };

        return Carbon::now()->diffInHours($this->date_creation) > $hoursLimit;
    }

    /**
     * Priority constants
     */
    const PRIORITY_CRITICAL = 'critique';
    const PRIORITY_HIGH = 'haute';
    const PRIORITY_NORMAL = 'normale';
    const PRIORITY_LOW = 'basse';

    /**
     * Status constants
     */
    const STATUS_OPEN = 'ouvert';
    const STATUS_IN_PROGRESS = 'en_cours';
    const STATUS_WAITING = 'en_attente';
    const STATUS_RESOLVED = 'resolu';
    const STATUS_CLOSED = 'ferme';
    const STATUS_CANCELLED = 'annule';
}
