<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Operator extends Model
{
    /** @use HasFactory<\Database\Factories\OperatorFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'employee_id',
        'shift_preference',
    ];

    protected function casts(): array
    {
        return [
            'shift_preference' => 'string',
        ];
    }

    public function machines(): HasMany
    {
        return $this->hasMany(Machine::class, 'current_operator_id');
    }
}
