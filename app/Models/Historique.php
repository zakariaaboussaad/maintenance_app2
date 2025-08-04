<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Historique extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_historique';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'action',
        'description',
        'date_action',
        'ancienne_valeur',
        'nouvelle_valeur',
        'user_id',
        'equipement_id',
        'ticket_id',
        'panne_id',
        'intervention_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date_action' => 'datetime',
            'ancienne_valeur' => 'array',
            'nouvelle_valeur' => 'array',
        ];
    }

    /**
     * Relationship with User
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id_user');
    }

    /**
     * Relationship with Equipement
     */
    public function equipement()
    {
        return $this->belongsTo(Equipement::class, 'equipement_id', 'numero_serie');
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
     * Relationship with Intervention
     */
    public function intervention()
    {
        return $this->belongsTo(Intervention::class, 'intervention_id', 'id_intervention');
    }

    /**
     * Boot method to set date_action
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($historique) {
            if (!$historique->date_action) {
                $historique->date_action = Carbon::now();
            }
        });
    }

    /**
     * Scope for actions by type
     */
    public function scopeByAction($query, $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope for recent actions (last 30 days)
     */
    public function scopeRecent($query)
    {
        return $query->where('date_action', '>=', Carbon::now()->subDays(30));
    }

    /**
     * Scope for actions by user
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope for equipment history
     */
    public function scopeForEquipement($query, $equipementId)
    {
        return $query->where('equipement_id', $equipementId);
    }

    /**
     * Scope for ticket history
     */
    public function scopeForTicket($query, $ticketId)
    {
        return $query->where('ticket_id', $ticketId);
    }

    /**
     * Scope for panne history
     */
    public function scopeForPanne($query, $panneId)
    {
        return $query->where('panne_id', $panneId);
    }

    /**
     * Get time since action
     */
    public function getTimeSinceActionAttribute(): string
    {
        return $this->date_action->diffForHumans();
    }

    /**
     * Get related entity (polymorphic)
     */
    public function getRelatedEntityAttribute()
    {
        if ($this->equipement_id) {
            return $this->equipement;
        }
        if ($this->ticket_id) {
            return $this->ticket;
        }
        if ($this->panne_id) {
            return $this->panne;
        }
        if ($this->intervention_id) {
            return $this->intervention;
        }
        return null;
    }

    /**
     * Get entity type
     */
    public function getEntityTypeAttribute(): ?string
    {
        if ($this->equipement_id) return 'equipement';
        if ($this->ticket_id) return 'ticket';
        if ($this->panne_id) return 'panne';
        if ($this->intervention_id) return 'intervention';
        return null;
    }

    /**
     * Get changes summary
     */
    public function getChangesSummaryAttribute(): array
    {
        if (!$this->ancienne_valeur || !$this->nouvelle_valeur) {
            return [];
        }

        $changes = [];
        $old = $this->ancienne_valeur;
        $new = $this->nouvelle_valeur;

        foreach ($new as $key => $value) {
            if (!isset($old[$key]) || $old[$key] !== $value) {
                $changes[$key] = [
                    'old' => $old[$key] ?? null,
                    'new' => $value
                ];
            }
        }

        return $changes;
    }

    /**
     * Create history record
     */
    public static function createRecord(
        string $action,
        string $description,
        int $userId,
        ?string $equipementId = null,
        ?int $ticketId = null,
        ?int $panneId = null,
        ?int $interventionId = null,
        ?array $oldValue = null,
        ?array $newValue = null
    ): self {
        return self::create([
            'action' => $action,
            'description' => $description,
            'user_id' => $userId,
            'equipement_id' => $equipementId,
            'ticket_id' => $ticketId,
            'panne_id' => $panneId,
            'intervention_id' => $interventionId,
            'ancienne_valeur' => $oldValue,
            'nouvelle_valeur' => $newValue,
        ]);
    }

    /**
     * Log equipment action
     */
    public static function logEquipmentAction(string $action, string $description, int $userId, string $equipementId, ?array $oldValue = null, ?array $newValue = null): self
    {
        return self::createRecord($action, $description, $userId, $equipementId, null, null, null, $oldValue, $newValue);
    }

    /**
     * Log ticket action
     */
    public static function logTicketAction(string $action, string $description, int $userId, int $ticketId, ?array $oldValue = null, ?array $newValue = null): self
    {
        return self::createRecord($action, $description, $userId, null, $ticketId, null, null, $oldValue, $newValue);
    }

    /**
     * Log panne action
     */
    public static function logPanneAction(string $action, string $description, int $userId, int $panneId, ?array $oldValue = null, ?array $newValue = null): self
    {
        return self::createRecord($action, $description, $userId, null, null, $panneId, null, $oldValue, $newValue);
    }

    /**
     * Log intervention action
     */
    public static function logInterventionAction(string $action, string $description, int $userId, int $interventionId, ?array $oldValue = null, ?array $newValue = null): self
    {
        return self::createRecord($action, $description, $userId, null, null, null, $interventionId, $oldValue, $newValue);
    }

    /**
     * Action constants
     */
    const ACTION_CREATE = 'Création';
    const ACTION_UPDATE = 'Modification';
    const ACTION_DELETE = 'Suppression';
    const ACTION_ASSIGN = 'Attribution';
    const ACTION_UNASSIGN = 'Désattribution';
    const ACTION_STATUS_CHANGE = 'Changement de statut';
    const ACTION_PRIORITY_CHANGE = 'Changement de priorité';
    const ACTION_CLOSE = 'Fermeture';
    const ACTION_REOPEN = 'Réouverture';
    const ACTION_MAINTENANCE = 'Maintenance';
    const ACTION_REPAIR = 'Réparation';
    const ACTION_INSTALL = 'Installation';
    const ACTION_UNINSTALL = 'Désinstallation';
}
