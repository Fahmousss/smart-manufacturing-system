<?php

namespace App\Http\Controllers;

use App\Models\Machine;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class DashboardController extends Controller
{
    /**
     * Display the dashboard with real-time machine data
     */
    public function index(): InertiaResponse
    {
        // Get latest temperature for each machine
        $latestTemps = \DB::table('machine_temperature_logs')
            ->select('machine_id', \DB::raw('MAX(temperature) as latest_temp'))
            ->where('recorded_at', '>=', now()->subHour())
            ->groupBy('machine_id')
            ->pluck('latest_temp', 'machine_id');

        // Get today's production for each machine
        $todayProduction = \DB::table('production_data')
            ->select('machine_id', \DB::raw('SUM(units_produced) as total_units'))
            ->whereDate('recorded_at', today())
            ->groupBy('machine_id')
            ->pluck('total_units', 'machine_id');

        $machines = Machine::with(['currentOperator'])
            ->get()
            ->map(function ($machine) use ($latestTemps, $todayProduction) {
                return [
                    'id' => $machine->id,
                    'name' => $machine->name,
                    'type' => $machine->type,
                    'status' => $machine->status,
                    'mqtt_topic_id' => $machine->mqtt_topic_id,
                    'current_operator' => $machine->currentOperator ? [
                        'id' => $machine->currentOperator->id,
                        'name' => $machine->currentOperator->name,
                        'employee_id' => $machine->currentOperator->employee_id,
                    ] : null,
                    // Load actual data from database
                    'latest_production' => $todayProduction[$machine->id] ?? 0,
                    'latest_temperature' => $latestTemps[$machine->id] ?? 0,
                ];
            });

        // Calculate statistics from machines
        $totalMachines = $machines->count();
        $runningMachines = $machines->where('status', 'running')->count();

        // Get today's total production from production_data table
        $totalProduction = \DB::table('production_data')
            ->whereDate('recorded_at', today())
            ->sum('units_produced') ?? 0;

        // Get average temperature from recent temperature logs (last hour)
        $avgTemperature = \DB::table('machine_temperature_logs')
            ->where('recorded_at', '>=', now()->subHour())
            ->avg('temperature') ?? 0;

        return Inertia::render('dashboard', [
            'machines' => $machines,
            'stats' => [
                'total_machines' => $totalMachines,
                'running_machines' => $runningMachines,
                'total_production' => (int) $totalProduction,
                'avg_temperature' => round($avgTemperature, 1),
            ],
        ]);
    }
}
