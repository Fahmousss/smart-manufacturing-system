<?php

use App\Models\User;
use App\Models\Machine;

test('machines page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get('/machines');

    $response->assertOk();
});

test('machines can be created', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->post('/machines', [
            'name' => 'Test Machine',
            'type' => 'CNC',
            'status' => 'idle',
        ]);

    $response->assertRedirect('/machines');
    $this->assertDatabaseHas('machines', [
        'name' => 'Test Machine',
        'type' => 'CNC',
    ]);
});
