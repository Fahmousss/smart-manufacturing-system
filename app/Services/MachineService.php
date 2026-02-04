<?php

namespace App\Services;

use App\Models\Machine;
use Illuminate\Database\Eloquent\Collection;

class MachineService
{
    /**
     * Get all machines with operator relationship
     */
    public function getAll(): Collection
    {
        return Machine::with('currentOperator')->get();
    }

    /**
     * Get a single machine by ID with relationships
     */
    public function getById(int $id): Machine
    {
        return Machine::with(['currentOperator', 'productionData', 'temperatureLogs'])
            ->findOrFail($id);
    }

    /**
     * Create a new machine
     */
    public function create(array $data): Machine
    {
        return Machine::create($data);
    }

    /**
     * Update an existing machine
     */
    public function update(Machine $machine, array $data): Machine
    {
        $machine->update($data);

        return $machine->fresh(['currentOperator']);
    }

    /**
     * Delete a machine
     */
    public function delete(Machine $machine): bool
    {
        return $machine->delete();
    }
}
