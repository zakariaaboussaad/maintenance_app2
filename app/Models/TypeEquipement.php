<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TypeEquipement extends Model
{
    use HasFactory;

    protected $table = 'type_equipements';
    protected $primaryKey = 'id_type';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nom_type',
        'description',
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
     * Relationship with Equipements
     */
    public function equipements()
    {
        return $this->hasMany(Equipement::class, 'type_equipement_id', 'id_type');
    }

    /**
     * Scope for active types
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get count of equipment for this type
     */
    public function getEquipementCountAttribute()
    {
        return $this->equipements()->count();
    }

    /**
     * Get active equipment count for this type
     */
    public function getActiveEquipementCountAttribute()
    {
        return $this->equipements()->where('status', 'Actif')->count();
    }
}
