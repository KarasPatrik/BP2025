<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('fav_sim_simulation_model', function (Blueprint $table) {
            $table->foreignId('fav_sim_id')->constrained()->onDelete('cascade');
            $table->foreignId('simulation_model_id')->constrained()->onDelete('cascade');
            $table->primary(['fav_sim_id', 'simulation_model_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fav_sim_simulation_model');
    }
};
