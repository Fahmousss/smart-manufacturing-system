<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('production_data', function (Blueprint $table) {
            $table->id();
            $table->foreignId('machine_id')->constrained('machines')->cascadeOnDelete();
            $table->integer('units_produced');
            $table->timestamp('recorded_at');
            $table->enum('shift_type', ['morning', 'afternoon', 'night']);
            $table->timestamps();

            $table->index(['machine_id', 'recorded_at']);
            $table->index(['shift_type', 'recorded_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('production_data');
    }
};
