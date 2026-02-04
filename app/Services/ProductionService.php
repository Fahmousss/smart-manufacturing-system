<?php

namespace App\Services;

use App\Events\MachineDataUpdated;
use App\Events\MachineStatusChanged;
use App\Events\TemperatureAlertTriggered;
use App\Models\Machine;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProductionService
{
    /**
     * Record production data using stored procedure
     */
    public function recordProductionData(int $machineId, int $units, string $timestamp): bool
    {
        try {
            $result = DB::select(
                'SELECT * FROM sp_record_production_data(?, ?, ?::timestamp)',
                [$machineId, $units, $timestamp]
            );

            if ($result && $result[0]->success) {
                $machine = Machine::find($machineId);

                Log::info("Production data recorded", [
                    'machine_id' => $machineId,
                    'units' => $units,
                    'timestamp' => $timestamp,
                ]);

                // Broadcast event
                if ($machine) {
                    event(new MachineDataUpdated(
                        $machineId,
                        $machine->name,
                        $units,
                        $timestamp
                    ));
                }

                return true;
            }

            Log::error("Failed to record production data", [
                'machine_id' => $machineId,
                'message' => $result[0]->message ?? 'Unknown error',
            ]);

            return false;
        } catch (\Exception $e) {
            Log::error("Exception recording production data", [
                'machine_id' => $machineId,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Update machine status using stored procedure
     */
    public function updateMachineStatus(int $machineId, string $status): bool
    {
        try {
            $result = DB::select(
                'SELECT * FROM sp_update_machine_status(?, ?)',
                [$machineId, $status]
            );

            if ($result && $result[0]->success) {
                $machine = Machine::find($machineId);

                Log::info("Machine status updated", [
                    'machine_id' => $machineId,
                    'status' => $status,
                    'previous_status' => $result[0]->previous_status,
                ]);

                // Broadcast event
                if ($machine) {
                    event(new MachineStatusChanged(
                        $machineId,
                        $machine->name,
                        $status,
                        $result[0]->previous_status ?? 'unknown'
                    ));
                }

                return true;
            }

            return false;
        } catch (\Exception $e) {
            Log::error("Exception updating machine status", [
                'machine_id' => $machineId,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Record temperature data using stored procedure
     */
    public function recordTemperature(int $machineId, float $temperature, string $timestamp): bool
    {
        try {
            $result = DB::select(
                'SELECT * FROM sp_record_temperature(?, ?, ?::timestamp)',
                [$machineId, $temperature, $timestamp]
            );

            if ($result && $result[0]->success) {
                $machine = Machine::find($machineId);

                if ($result[0]->alert_triggered) {
                    Log::warning("Temperature alert triggered", [
                        'machine_id' => $machineId,
                        'temperature' => $temperature,
                    ]);

                    // Broadcast alert event
                    if ($machine) {
                        event(new TemperatureAlertTriggered(
                            $machineId,
                            $machine->name,
                            $temperature,
                            $timestamp
                        ));
                    }
                }

                return true;
            }

            return false;
        } catch (\Exception $e) {
            Log::error("Exception recording temperature", [
                'machine_id' => $machineId,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Update machine operator
     */
    public function updateMachineOperator(int $machineId, ?int $operatorId): bool
    {
        try {
            $machine = Machine::findOrFail($machineId);
            $machine->current_operator_id = $operatorId;
            $machine->save();

            Log::info("Machine operator updated", [
                'machine_id' => $machineId,
                'operator_id' => $operatorId,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error("Exception updating machine operator", [
                'machine_id' => $machineId,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }
}
