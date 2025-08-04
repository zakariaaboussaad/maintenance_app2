<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Ticket extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_ticket';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'numero_ticket',
        'objet',
        'description',
        'date_creation',
        'date_cloture',
        'priorite',
        'type_demande',
        'demandeur_id',
        'equipement_id',
        'panne_id',
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
            'date_creation' => 'datetime',
            'date_cloture' => 'datetime',
        ];
    }

    /**
     * Relationship with User (demandeur)
     */
    public function demandeur()
    {
        return $this->belongsTo(User::class, 'demandeur_id', 'id_user');
    }

    /**
     * Relationship with Equipement
     */
    public function equipement()
    {
        return $this->belongsTo(Equipement::class, 'equipement_id', 'numero_serie');
    }

    /**
     * Relationship with Panne
     */
    public function panne()
    {
        return $this->belongsTo(Panne::class, 'panne_id', 'id_panne');
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
     * Relationship with Interventions
     */
    public function interventions()
    {
        return $this->hasMany(Intervention::class, 'ticket_id', 'id_ticket');
    }

    /**
     * Relationship with Historiques
     */
    public function historiques()
    {
        return $this->hasMany(Historique::class, 'ticket_id', 'id_ticket');
    }

    /**
     * Boot method to generate ticket number
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($ticket) {
            if (!$ticket->numero_ticket) {
                $ticket->numero_ticket = self::generateTicketNumber();
            }
            if (!$ticket->date_creation) {
                $ticket->date_creation = Carbon::now();
            }
        });
    }

    /**
     * Generate unique ticket number
     */
    public static function generateTicketNumber(): string
    {
        $prefix = 'TK';
        $year = date('Y');
        $month = date('m');

        $lastTicket = self::whereYear('date_creation', $year)
                         ->whereMonth('date_creation', $month)
                         ->orderBy('id_ticket', 'desc')
                         ->first();

        $sequence = $lastTicket ? intval(substr($lastTicket->numero_ticket, -4)) + 1 : 1;

        return $prefix . $year . $month . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Scope for open tickets
     */
    public function scopeOpen($query)
    {
        return $query->whereHas('status', function ($q) {
            $q->where('is_final', false);
        });
    }

    /**
     * Scope for closed tickets
     */
    public function scopeClosed($query)
    {
        return $query->whereHas('status', function ($q) {
            $q->where('is_final', true);
        });
    }

    /**
     * Scope for high priority tickets
     */
    public function scopeHighPriority($query)
    {
        return $query->where('priorite', 'Haute');
    }

    /**
     * Scope for tickets by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type_demande', $type);
    }

    /**
     * Scope for my tickets (by user)
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('demandeur_id', $userId);
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
        if (!$this->date_cloture) {
            return null;
        }

        return $this->date_creation->diffInMinutes($this->date_cloture);
    }

    /**
     * Check if ticket is overdue
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

        return Carbon::now()->diffInHours($this->date_creation) > $hoursLimit;
    }

    /**
     * Priority constants
     */
    const PRIORITY_HIGH = 'Haute';
    const PRIORITY_MEDIUM = 'Moyenne';
    const PRIORITY_LOW = 'Basse';

    /**
     * Type constants
     */
    const TYPE_INCIDENT = 'Incident';
    const TYPE_DEMANDE = 'Demande';
    const TYPE_MAINTENANCE = 'Maintenance';
}
