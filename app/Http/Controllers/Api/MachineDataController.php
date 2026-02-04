<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\RecordProductionRequest;
use App\Http\Requests\Api\RecordTemperatureRequest;
use App\Http\Requests\Api\UpdateMachineOperatorRequest;
use App\Http\Requests\Api\UpdateMachineStatusRequest;
use App\Models\Machine;
use App\Services\ProductionService;
use Illuminate\Http\JsonResponse;

class MachineDataController extends Controller
{
    public function __construct(
        private ProductionService $productionService
    ) {
    }

    /**
     * Record production data for a machine
     */
    public function recordProduction(RecordProductionRequest $request, Machine $machine): JsonResponse
    {
        $data = $request->validated();

        $success = $this->productionService->recordProductionData(
            $machine->id,
            $data['units'],
            $data['timestamp'] ?? now()->toDateTimeString()
        );

        if ($success) {
            return response()->json([
                'success' => true,
                'message' => 'Production data recorded successfully',
                'data' => [
                    'machine_id' => $machine->id,
                    'machine_name' => $machine->name,
                    'units' => $data['units'],
                ],
            ], 201);
        }

        return response()->json([
            'success' => false,
            'message' => 'Failed to record production data',
        ], 500);
    }

    /**
     * Record temperature reading for a machine
     */
    public function recordTemperature(RecordTemperatureRequest $request, Machine $machine): JsonResponse
    {
        $data = $request->validated();

        $success = $this->productionService->recordTemperature(
            $machine->id,
            $data['temperature'],
            $data['timestamp'] ?? now()->toDateTimeString()
        );

        if ($success) {
            return response()->json([
                'success' => true,
                'message' => 'Temperature recorded successfully',
                'data' => [
                    'machine_id' => $machine->id,
                    'machine_name' => $machine->name,
                    'temperature' => $data['temperature'],
                ],
            ], 201);
        }

        return response()->json([
            'success' => false,
            'message' => 'Failed to record temperature',
        ], 500);
    }

    /**
     * Update machine status
     */
    public function updateStatus(UpdateMachineStatusRequest $request, Machine $machine): JsonResponse
    {
        $data = $request->validated();

        $success = $this->productionService->updateMachineStatus(
            $machine->id,
            $data['status']
        );

        if ($success) {
            return response()->json([
                'success' => true,
                'message' => 'Machine status updated successfully',
                'data' => [
                    'machine_id' => $machine->id,
                    'machine_name' => $machine->name,
                    'status' => $data['status'],
                ],
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Failed to update machine status',
        ], 500);
    }

    /**
     * Update machine operator assignment
     */
    public function updateOperator(UpdateMachineOperatorRequest $request, Machine $machine): JsonResponse
    {
        $data = $request->validated();

        $success = $this->productionService->updateMachineOperator(
            $machine->id,
            $data['operator_id'] ?? null
        );

        if ($success) {
            return response()->json([
                'success' => true,
                'message' => 'Machine operator updated successfully',
                'data' => [
                    'machine_id' => $machine->id,
                    'machine_name' => $machine->name,
                    'operator_id' => $data['operator_id'] ?? null,
                ],
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Failed to update machine operator',
        ], 500);
    }
}
