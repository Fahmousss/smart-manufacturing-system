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
        Schema::create('production_shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('machine_id')->constrained('machines')->cascadeOnDelete();
            $table->date('shift_date');
            $table->enum('shift_type', ['morning', 'afternoon', 'night']);
            $table->integer('total_units')->default(0);
            $table->decimal('avg_temperature', 5, 2)->nullable();
            $table->integer('downtime_minutes')->default(0);
            $table->timestamps();

            $table->unique(['machine_id', 'shift_date', 'shift_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('production_shifts');
    }
};
