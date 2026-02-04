<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMachineRequest;
use App\Http\Requests\UpdateMachineRequest;
use App\Models\Machine;
use App\Models\Operator;
use App\Services\MachineService;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Illuminate\Http\RedirectResponse;

class MachineController extends Controller
{
    public function __construct(
        private MachineService $machineService
    ) {
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): InertiaResponse
    {
        $machines = $this->machineService->getAll();

        return Inertia::render('machines/index', [
            'machines' => $machines,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): InertiaResponse
    {
        $operators = Operator::all();

        return Inertia::render('machines/create', [
            'operators' => $operators,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMachineRequest $request): RedirectResponse
    {
        $this->machineService->create($request->validated());

        return redirect()->route('machines.index')
            ->with('success', 'Machine created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Machine $machine): InertiaResponse
    {
        $operators = Operator::all();

        return Inertia::render('machines/edit', [
            'machine' => $machine->load('currentOperator'),
            'operators' => $operators,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMachineRequest $request, Machine $machine): RedirectResponse
    {
        $this->machineService->update($machine, $request->validated());

        return redirect()->route('machines.index')
            ->with('success', 'Machine updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Machine $machine): RedirectResponse
    {
        $this->machineService->delete($machine);

        return redirect()->route('machines.index')
            ->with('success', 'Machine deleted successfully.');
    }
}
