<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Operator>
 */
class OperatorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'employee_id' => 'EMP' . fake()->unique()->numberBetween(1000, 9999),
            'shift_preference' => fake()->randomElement(['morning', 'afternoon', 'night']),
        ];
    }
}
