<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Notification extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_notification';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'titre',
        'message',
        'type_notification',
        'date_envoi',
        'is_read',
        'data',
        'user_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date_envoi' => 'datetime',
            'is_read' => 'boolean',
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
     * Boot method to set date_envoi
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($notification) {
            if (!$notification->date_envoi) {
                $notification->date_envoi = Carbon::now();
            }
        });
    }

    /**
     * Scope for unread notifications
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope for read notifications
     */
    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    /**
     * Scope for notifications by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type_notification', $type);
    }

    /**
     * Scope for recent notifications (last 7 days)
     */
    public function scopeRecent($query)
    {
        return $query->where('date_envoi', '>=', Carbon::now()->subDays(7));
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
        $this->update(['is_read' => true]);
    }

    /**
     * Mark notification as unread
     */
    public function markAsUnread(): void
    {
        $this->update(['is_read' => false]);
    }

    /**
     * Get time since sent
     */
    public function getTimeSinceSentAttribute(): string
    {
        return $this->date_envoi->diffForHumans();
    }

    /**
     * Get notification icon based on type
     */
    public function getIconAttribute(): string
    {
        return match ($this->type_notification) {
            'ticket_nouveau' => 'ticket',
            'ticket_assigne' => 'user-check',
            'ticket_ferme' => 'check-circle',
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
        return match ($this->type_notification) {
            'ticket_nouveau' => 'blue',
            'ticket_assigne' => 'green',
            'ticket_ferme' => 'gray',
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
            'type_notification' => $type,
            'titre' => $titre,
            'message' => $message,
            'data' => $data,
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
    const TYPE_TICKET_NEW = 'ticket_nouveau';
    const TYPE_TICKET_ASSIGNED = 'ticket_assigne';
    const TYPE_TICKET_CLOSED = 'ticket_ferme';
    const TYPE_PANNE_REPORTED = 'panne_signale';
    const TYPE_PANNE_RESOLVED = 'panne_resolue';
    const TYPE_INTERVENTION_PLANNED = 'intervention_planifiee';
    const TYPE_INTERVENTION_COMPLETED = 'intervention_terminee';
    const TYPE_MAINTENANCE_DUE = 'maintenance_due';
    const TYPE_EQUIPMENT_EXPIRED = 'equipement_expire';
}
