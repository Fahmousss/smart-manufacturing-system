<?php

namespace Database\Factories;

use App\Models\Operator;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Machine>
 */
class MachineFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = ['CNC', 'Milling', 'Press', 'Assembly'];
        $type = fake()->randomElement($types);

        return [
            'name' => $type . ' Machine ' . fake()->unique()->numberBetween(1, 99),
            'type' => $type,
            'status' => fake()->randomElement(['running', 'idle', 'maintenance', 'warning']),
            'mqtt_topic_id' => 'machine_' . fake()->unique()->numberBetween(100, 999),
            'current_operator_id' => fake()->boolean(70) ? Operator::factory() : null,
        ];
    }
}
