<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductionShift extends Model
{
    protected $fillable = [
        'machine_id',
        'shift_date',
        'shift_type',
        'total_units',
        'avg_temperature',
        'downtime_minutes',
    ];

    protected function casts(): array
    {
        return [
            'shift_date' => 'date',
            'shift_type' => 'string',
            'total_units' => 'integer',
            'avg_temperature' => 'decimal:2',
            'downtime_minutes' => 'integer',
        ];
    }

    public function machine(): BelongsTo
    {
        return $this->belongsTo(Machine::class);
    }
}
