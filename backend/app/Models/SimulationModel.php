<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class SimulationModel extends Model
{
    protected $table = 'simulation_models';

    protected $fillable = ['name'];

    public function favSims(): BelongsToMany
    {
        return $this->belongsToMany(FavSim::class);
    }
}
