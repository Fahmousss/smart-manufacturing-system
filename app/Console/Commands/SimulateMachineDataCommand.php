<?php

namespace App\Console\Commands;

use App\Models\Machine;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class SimulateMachineDataCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'machines:simulate {--interval=5 : Interval in seconds between data publications}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Simulate machine data by publishing to MQTT topics';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $interval = (int) $this->option('interval');
        $machines = Machine::all();

        if ($machines->isEmpty()) {
            $this->error('No machines found. Please seed the database first.');
            return Command::FAILURE;
        }

        $this->info("Simulating data for {$machines->count()} machines");
        $this->info("Publishing every {$interval} seconds");
        $this->info('Press Ctrl+C to stop');

        while (true) {
            try {
                foreach ($machines as $machine) {
                    $this->simulateMachineData($machine);
                }

            } catch (\Exception $e) {
                $this->warn("Connection error: {$e->getMessage()}");
                $this->info("Retrying in {$interval} seconds...");
            }

            sleep($interval);
        }

        return Command::SUCCESS;
    }

    /**
     * Simulate data for a single machine
     */
    private function simulateMachineData(Machine $machine): void // Removed $mqtt parameter
    {
        $timestamp = now()->toDateTimeString();
        $baseUrl = config('app.url'); // Added for HTTP requests

        // Simulate production count (1-10 units per interval)
        if ($machine->status === 'running') {
            $units = rand(1, 10);

            try {
                Http::post("{$baseUrl}/api/machines/{$machine->id}/production", [
                    'units' => $units,
                    'timestamp' => $timestamp,
                ]);
                $this->line("📊 {$machine->name}: Produced {$units} units");
            } catch (\Exception $e) {
                $this->error("Failed to record production: {$e->getMessage()}");
            }
        }

        // Simulate temperature (60-90°C, with occasional spikes)
        $temperature = rand(60, 90) + (rand(0, 100) > 90 ? rand(10, 20) : 0);

        try {
            Http::post("{$baseUrl}/api/machines/{$machine->id}/temperature", [
                'temperature' => $temperature,
                'timestamp' => $timestamp,
            ]);

            if ($temperature > 80) {
                $this->warn("🌡️  {$machine->name}: High temperature {$temperature}°C");
            }
        } catch (\Exception $e) {
            $this->error("Failed to record temperature: {$e->getMessage()}");
        }

        // Randomly change status (10% chance)
        if (rand(1, 100) <= 10) {
            $statuses = ['running', 'idle', 'maintenance'];
            $newStatus = $statuses[array_rand($statuses)];

            try {
                Http::post("{$baseUrl}/api/machines/{$machine->id}/status", [
                    'status' => $newStatus,
                ]);
                $this->info("⚙️  {$machine->name}: Status changed to {$newStatus}");
            } catch (\Exception $e) {
                $this->error("Failed to update status: {$e->getMessage()}");
            }
        }
    }
}
