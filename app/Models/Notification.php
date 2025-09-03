<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Notification extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    
    /**
     * The name of the "created at" column.
     */
    const CREATED_AT = 'created_at';
    
    /**
     * The name of the "updated at" column.
     */
    const UPDATED_AT = 'updated_at';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'titre',
        'message',
        'type',
        'date_creation',
        'lu',
        'user_id',
        'ticket_id',
        'panne_id',
        'equipement_id',
        'priorite',
        'data'
    ];

    protected $table = 'notifications';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date_creation' => 'datetime',
            'lu' => 'boolean',
            'data' => 'array',
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
     * Boot method to set date_creation
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($notification) {
            if (!$notification->date_creation) {
                $notification->date_creation = Carbon::now();
            }
        });
    }

    /**
     * Scope for unread notifications
     */
    public function scopeUnread($query)
    {
        return $query->where('lu', false);
    }

    /**
     * Scope for read notifications
     */
    public function scopeRead($query)
    {
        return $query->where('lu', true);
    }

    /**
     * Scope for notifications by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope for recent notifications (last 7 days)
     */
    public function scopeRecent($query)
    {
        return $query->where('date_creation', '>=', Carbon::now()->subDays(7));
    }

    /**
     * Scope for notifications by user
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(): void
    {
        $this->update(['lu' => true]);
    }

    /**
     * Mark notification as unread
     */
    public function markAsUnread(): void
    {
        $this->update(['lu' => false]);
    }

    /**
     * Get time since sent
     */
    public function getTimeSinceSentAttribute(): string
    {
        return $this->date_creation->diffForHumans();
    }

    /**
     * Get notification icon based on type
     */
    public function getIconAttribute(): string
    {
        return match ($this->type) {
            'ticket_nouveau' => 'ticket',
            'ticket_assigne' => 'user-check',
            'ticket_mis_a_jour' => 'edit',
            'ticket_ferme' => 'check-circle',
            'commentaire_ajoute' => 'message-circle',
            'panne_signale' => 'alert-triangle',
            'panne_resolue' => 'check-circle-2',
            'intervention_planifiee' => 'calendar',
            'intervention_terminee' => 'wrench',
            'maintenance_due' => 'clock',
            'equipement_expire' => 'alert-circle',
            default => 'bell'
        };
    }

    /**
     * Get notification color based on type
     */
    public function getColorAttribute(): string
    {
        return match ($this->type) {
            'ticket_nouveau' => 'blue',
            'ticket_assigne' => 'green',
            'ticket_mis_a_jour' => 'blue',
            'ticket_ferme' => 'gray',
            'commentaire_ajoute' => 'purple',
            'panne_signale' => 'red',
            'panne_resolue' => 'green',
            'intervention_planifiee' => 'yellow',
            'intervention_terminee' => 'green',
            'maintenance_due' => 'orange',
            'equipement_expire' => 'red',
            default => 'gray'
        };
    }

    /**
     * Create notification for user
     */
    public static function createForUser($userId, $type, $titre, $message, $data = null): self
    {
        return self::create([
            'user_id' => $userId,
            'type' => $type,
            'titre' => $titre,
            'message' => $message,
            'data' => $data,
            'date_creation' => now(),
            'lu' => false,
        ]);
    }

    /**
     * Create notification for multiple users
     */
    public static function createForUsers(array $userIds, $type, $titre, $message, $data = null): void
    {
        foreach ($userIds as $userId) {
            self::createForUser($userId, $type, $titre, $message, $data);
        }
    }

    /**
     * Type constants
     */
    // Ticket related notifications
    const TYPE_TICKET_NEW = 'ticket_nouveau';
    const TYPE_TICKET_ASSIGNED = 'ticket_assigne';
    const TYPE_TICKET_UPDATED = 'ticket_mis_a_jour';
    const TYPE_TICKET_CLOSED = 'ticket_ferme';
    
    // Comment related notifications
    const TYPE_COMMENT_ADDED = 'commentaire_ajoute';
    
    // Equipment related notifications
    const TYPE_PANNE_REPORTED = 'panne_signale';
    const TYPE_PANNE_RESOLVED = 'panne_resolue';
    
    // Intervention related notifications
    const TYPE_INTERVENTION_PLANNED = 'intervention_planifiee';
    const TYPE_INTERVENTION_COMPLETED = 'intervention_terminee';
    
    // Maintenance related notifications
    const TYPE_MAINTENANCE_DUE = 'maintenance_due';
    const TYPE_MAINTENANCE_COMPLETED = 'maintenance_terminee';
    const TYPE_EQUIPMENT_EXPIRED = 'equipement_expire';
    const TYPE_SYSTEM = 'system';
}
