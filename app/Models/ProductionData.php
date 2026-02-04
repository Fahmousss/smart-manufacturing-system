<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductionData extends Model
{
    protected $fillable = [
        'machine_id',
        'units_produced',
        'recorded_at',
        'shift_type',
    ];

    protected function casts(): array
    {
        return [
            'recorded_at' => 'datetime',
            'shift_type' => 'string',
        ];
    }

    public function machine(): BelongsTo
    {
        return $this->belongsTo(Machine::class);
    }
}
