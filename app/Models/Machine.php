<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Machine extends Model
{
    /** @use HasFactory<\Database\Factories\MachineFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'status',
        'current_operator_id',
        'mqtt_topic_id',
    ];

    protected function casts(): array
    {
        return [
            'type' => 'string',
            'status' => 'string',
        ];
    }

    public function currentOperator(): BelongsTo
    {
        return $this->belongsTo(Operator::class, 'current_operator_id');
    }

    public function productionData(): HasMany
    {
        return $this->hasMany(ProductionData::class);
    }

    public function temperatureLogs(): HasMany
    {
        return $this->hasMany(MachineTemperatureLog::class);
    }

    public function productionShifts(): HasMany
    {
        return $this->hasMany(ProductionShift::class);
    }
}
