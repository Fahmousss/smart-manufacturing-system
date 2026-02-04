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
        Schema::create('machines', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['CNC', 'Milling', 'Press', 'Assembly']);
            $table->enum('status', ['running', 'idle', 'maintenance', 'warning'])->default('idle');
            $table->foreignId('current_operator_id')->nullable()->constrained('operators')->nullOnDelete();
            $table->string('mqtt_topic_id')->unique();
            $table->timestamps();


            $table->index('status');
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('machines');
    }
};
